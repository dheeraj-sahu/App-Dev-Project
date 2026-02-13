# main.py
import os
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlmodel import Field, SQLModel, create_engine, Session, select
import jwt
import hashlib
import secrets

# ================= CONFIG =================
SECRET_KEY = os.getenv("FINSENSE_SECRET_KEY", "dev-secret-key-change-me")
JWT_ALGO = "HS256"
JWT_EXP_MINUTES = 60 * 24
DB_FILE = "finsense.db"
PAGES_DIR = os.path.join(os.path.dirname(__file__), "pages")
PAGES_ASSETS_DIR = os.path.join(PAGES_DIR, "assets")

# ================= APP ====================
engine = create_engine(
    f"sqlite:///{DB_FILE}",
    echo=False,
    connect_args={"check_same_thread": False},
)
app = FastAPI(title="Finsense - Backend Prototype")
os.makedirs(PAGES_ASSETS_DIR, exist_ok=True)
app.mount(
    "/pages/assets",
    StaticFiles(directory=PAGES_ASSETS_DIR),
    name="pages-assets",
)

# ================= MODELS =================
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    phone: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    key_salt: Optional[str] = None
    registered: bool = Field(default=False)

class OTP(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    phone: str
    code: str
    expires_at: datetime

class Device(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    device_id: str
    pubkey_pem: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class EncryptedProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    ciphertext_b64: str
    iv_b64: Optional[str] = None
    tag_b64: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    client_txn_id: str
    amount: float
    merchant: Optional[str] = None
    category: Optional[str] = None
    occurred_at: datetime
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted: bool = Field(default=False)

SQLModel.metadata.create_all(engine)

# ================= HELPERS =================
def create_jwt(payload: dict, expires_minutes=JWT_EXP_MINUTES):
    data = payload.copy()
    data["exp"] = datetime.utcnow() + timedelta(minutes=expires_minutes)
    return jwt.encode(data, SECRET_KEY, algorithm=JWT_ALGO)

def verify_jwt(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGO])
    except jwt.PyJWTError:
        return None

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_user_by_phone(phone: str):
    with Session(engine) as s:
        return s.exec(select(User).where(User.phone == phone)).first()

def require_user(token: str = Depends(oauth2_scheme)):
    payload = verify_jwt(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    with Session(engine) as s:
        user = s.get(User, payload["user_id"])
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user

# ================= SCHEMAS =================
class RegisterRequest(BaseModel):
    phone: str

class VerifyOTPRequest(BaseModel):
    phone: str
    code: str
    device_id: Optional[str] = None
    device_pubkey_pem: Optional[str] = None

class DeviceRegisterRequest(BaseModel):
    device_id: str
    device_pubkey_pem: str

class EncryptedProfileIn(BaseModel):
    ciphertext_b64: str
    iv_b64: Optional[str]
    tag_b64: Optional[str]

class TxnIn(BaseModel):
    client_txn_id: str
    amount: float
    merchant: Optional[str]
    category: Optional[str]
    occurred_at: datetime
    updated_at: Optional[datetime]
    deleted: Optional[bool] = False

class SyncRequest(BaseModel):
    last_sync: Optional[datetime] = None
    changes: List[TxnIn] = []

class SyncResponse(BaseModel):
    server_changes: List[dict]
    now: datetime

# ================= ROUTES =================
@app.post("/register")
def register(req: RegisterRequest):
    phone = req.phone
    otp_code = str(secrets.randbelow(900000) + 100000)

    with Session(engine) as s:
        # cleanup old OTPs
        old_otps = s.exec(select(OTP).where(OTP.phone == phone)).all()
        for o in old_otps:
            s.delete(o)

        user = get_user_by_phone(phone)
        if not user:
            s.add(User(phone=phone))

        s.add(
            OTP(
                phone=phone,
                code=otp_code,
                expires_at=datetime.utcnow() + timedelta(minutes=5),
            )
        )
        s.commit()

    # 🔴 DEV ONLY (replace with SMS gateway)
    print(f"📲 OTP for {phone}: {otp_code}")

    return {"ok": True, "message": "OTP sent"}

@app.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest):
    with Session(engine) as s:
        otp = s.exec(
            select(OTP).where(
                OTP.phone == req.phone,
                OTP.code == req.code,
            )
        ).first()

        if not otp or otp.expires_at < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")

        user = get_user_by_phone(req.phone)
        if not user:
            raise HTTPException(status_code=400, detail="User not found")

        user.registered = True
        s.add(user)

        if req.device_id and req.device_pubkey_pem:
            s.add(
                Device(
                    user_id=user.id,
                    device_id=req.device_id,
                    pubkey_pem=req.device_pubkey_pem,
                )
            )

        # ✅ FIXED OTP DELETE
        otps = s.exec(select(OTP).where(OTP.phone == req.phone)).all()
        for o in otps:
            s.delete(o)

        s.commit()

        token = create_jwt({"user_id": user.id})
        return {"access_token": token, "token_type": "bearer"}

@app.post("/device/register")
def device_register(req: DeviceRegisterRequest, user: User = Depends(require_user)):
    with Session(engine) as s:
        s.add(Device(user_id=user.id, device_id=req.device_id, pubkey_pem=req.device_pubkey_pem))
        s.commit()
    return {"ok": True}

@app.post("/profile/encrypted")
def upload_encrypted_profile(payload: EncryptedProfileIn, user: User = Depends(require_user)):
    with Session(engine) as s:
        ep = EncryptedProfile(user_id=user.id, **payload.dict())
        s.add(ep)
        s.commit()
        return {"ok": True, "id": ep.id}

@app.post("/sync", response_model=SyncResponse)
def sync(req: SyncRequest, user: User = Depends(require_user)):
    now = datetime.utcnow()
    server_changes = []

    with Session(engine) as s:
        for c in req.changes:
            stmt = select(Transaction).where(
                Transaction.user_id == user.id,
                Transaction.client_txn_id == c.client_txn_id,
            )
            existing = s.exec(stmt).first()

            updated_at = c.updated_at or now

            if existing:
                if updated_at > existing.updated_at:
                    existing.amount = c.amount
                    existing.merchant = c.merchant
                    existing.category = c.category
                    existing.occurred_at = c.occurred_at
                    existing.updated_at = updated_at
                    existing.deleted = c.deleted or False
            else:
                s.add(
                    Transaction(
                        user_id=user.id,
                        client_txn_id=c.client_txn_id,
                        amount=c.amount,
                        merchant=c.merchant,
                        category=c.category,
                        occurred_at=c.occurred_at,
                        updated_at=updated_at,
                        deleted=c.deleted or False,
                    )
                )
        s.commit()

        stmt2 = (
            select(Transaction)
            .where(Transaction.user_id == user.id)
            if not req.last_sync
            else select(Transaction).where(
                Transaction.user_id == user.id,
                Transaction.updated_at > req.last_sync,
            )
        )

        for tx in s.exec(stmt2):
            server_changes.append({
                "client_txn_id": tx.client_txn_id,
                "amount": tx.amount,
                "merchant": tx.merchant,
                "category": tx.category,
                "occurred_at": tx.occurred_at.isoformat(),
                "updated_at": tx.updated_at.isoformat(),
                "deleted": tx.deleted,
            })

    return SyncResponse(server_changes=server_changes, now=now)

@app.get("/health")
def health():
    return {"ok": True, "time": datetime.utcnow().isoformat()}

def page_file(name: str):
    return FileResponse(os.path.join(PAGES_DIR, name))

@app.get("/pages", response_class=HTMLResponse)
def pages_index():
    return page_file("index.html")

@app.get("/pages/index", response_class=HTMLResponse)
def pages_index_alias():
    return page_file("index.html")

@app.get("/pages/register", response_class=HTMLResponse)
def pages_register():
    return page_file("register.html")

@app.get("/pages/verify-otp", response_class=HTMLResponse)
def pages_verify_otp():
    return page_file("verify-otp.html")

@app.get("/pages/device", response_class=HTMLResponse)
def pages_device():
    return page_file("device.html")

@app.get("/pages/profile", response_class=HTMLResponse)
def pages_profile():
    return page_file("profile.html")

@app.get("/pages/sync", response_class=HTMLResponse)
def pages_sync():
    return page_file("sync.html")

@app.get("/pages/health", response_class=HTMLResponse)
def pages_health():
    return page_file("health.html")

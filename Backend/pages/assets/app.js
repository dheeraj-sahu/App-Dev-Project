function getEl(id) {
  return document.getElementById(id);
}

function setStatus(id, text) {
  const el = getEl(id);
  if (el) {
    el.textContent = text || "";
  }
}

function getToken() {
  return sessionStorage.getItem("accessToken");
}

function setToken(token) {
  if (token) {
    sessionStorage.setItem("accessToken", token);
  } else {
    sessionStorage.removeItem("accessToken");
  }
  updateTokenStatus();
}

function updateTokenStatus() {
  const status = getEl("tokenStatus");
  if (status) {
    status.textContent = getToken() ? "Token set." : "No token set.";
  }
  const input = getEl("tokenInput");
  if (input) {
    input.value = getToken() || "";
  }
}

function setTokenFromInput() {
  const input = getEl("tokenInput");
  if (!input) {
    return;
  }
  const token = input.value.trim();
  setToken(token || null);
}

function clearToken() {
  setToken(null);
}

async function apiCall(path, method, body, needsAuth) {
  const headers = { "Content-Type": "application/json" };
  if (needsAuth) {
    const token = getToken();
    if (!token) {
      throw new Error("No token set");
    }
    headers.Authorization = "Bearer " + token;
  }

  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let data = text;
  try {
    data = JSON.parse(text);
  } catch (err) {
    // leave as text
  }

  if (!res.ok) {
    throw new Error(typeof data === "string" ? data : JSON.stringify(data, null, 2));
  }

  return data;
}

async function register() {
  setStatus("regStatus", "");
  try {
    const phone = getEl("regPhone").value.trim();
    const data = await apiCall("/register", "POST", { phone }, false);
    setStatus("regStatus", JSON.stringify(data, null, 2));
  } catch (err) {
    setStatus("regStatus", "Error: " + err.message);
  }
}

async function verifyOtp() {
  setStatus("otpStatus", "");
  try {
    const phone = getEl("otpPhone").value.trim();
    const code = getEl("otpCode").value.trim();
    const deviceId = getEl("otpDeviceId").value.trim();
    const devicePubKey = getEl("otpDevicePubKey").value.trim();
    const payload = { phone, code };
    if (deviceId) {
      payload.device_id = deviceId;
    }
    if (devicePubKey) {
      payload.device_pubkey_pem = devicePubKey;
    }
    const data = await apiCall("/verify-otp", "POST", payload, false);
    setToken(data.access_token || null);
    setStatus("otpStatus", JSON.stringify(data, null, 2));
  } catch (err) {
    setStatus("otpStatus", "Error: " + err.message);
  }
}

async function registerDevice() {
  setStatus("devStatus", "");
  try {
    const deviceId = getEl("devId").value.trim();
    const devicePubKey = getEl("devPubKey").value.trim();
    const data = await apiCall(
      "/device/register",
      "POST",
      { device_id: deviceId, device_pubkey_pem: devicePubKey },
      true
    );
    setStatus("devStatus", JSON.stringify(data, null, 2));
  } catch (err) {
    setStatus("devStatus", "Error: " + err.message);
  }
}

async function uploadProfile() {
  setStatus("profileStatus", "");
  try {
    const payload = JSON.parse(getEl("profilePayload").value);
    const data = await apiCall("/profile/encrypted", "POST", payload, true);
    setStatus("profileStatus", JSON.stringify(data, null, 2));
  } catch (err) {
    setStatus("profileStatus", "Error: " + err.message);
  }
}

async function syncTxns() {
  setStatus("syncStatus", "");
  try {
    const payload = JSON.parse(getEl("syncPayload").value);
    const data = await apiCall("/sync", "POST", payload, true);
    setStatus("syncStatus", JSON.stringify(data, null, 2));
  } catch (err) {
    setStatus("syncStatus", "Error: " + err.message);
  }
}

async function health() {
  setStatus("healthStatus", "");
  try {
    const data = await apiCall("/health", "GET", null, false);
    setStatus("healthStatus", JSON.stringify(data, null, 2));
  } catch (err) {
    setStatus("healthStatus", "Error: " + err.message);
  }
}

document.addEventListener("DOMContentLoaded", updateTokenStatus);

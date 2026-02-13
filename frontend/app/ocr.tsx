import * as FileSystem from "expo-file-system/legacy";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";

export default function HomeScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>("");
  const [transactionJson, setTransactionJson] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canUseCamera = useMemo(() => Platform.OS !== "web", []);

  const downsizeImageTo1MB = useCallback(async (uri: string) => {
    const maxBytes = 1_000_000;
    const getSize = async (path: string) => {
      const info = await FileSystem.getInfoAsync(path, { size: true });
      return info.size ?? 0;
    };

    let currentUri = uri;
    let compress = 0.8;
    let width = 1600;
    let result = await ImageManipulator.manipulateAsync(
      currentUri,
      [{ resize: { width } }],
      { compress, format: ImageManipulator.SaveFormat.JPEG },
    );
    currentUri = result.uri;
    width = result.width ?? width;

    let size = await getSize(currentUri);
    let attempts = 0;

    while (size > maxBytes && attempts < 6) {
      width = Math.max(640, Math.floor(width * 0.85));
      compress = Math.max(0.4, compress - 0.1);

      result = await ImageManipulator.manipulateAsync(
        currentUri,
        [{ resize: { width } }],
        { compress, format: ImageManipulator.SaveFormat.JPEG },
      );
      currentUri = result.uri;
      width = result.width ?? width;
      size = await getSize(currentUri);
      attempts += 1;
    }

    return currentUri;
  }, []);

  const runOcr = useCallback(async (uri: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setOcrText("Recognizing Text...");
    setTransactionJson("");

    try {
      const formData = new FormData();

      formData.append("file", {
        uri: uri,
        type: "image/jpeg",
        name: "upload.jpg",
      } as any);

      formData.append("language", "eng");
      formData.append("isOverlayRequired", "false");
      formData.append("apikey", "helloworld");

      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
        headers: {},
      });

      const result = await response.json();

      if (result.OCRExitCode === 1 && result.ParsedResults) {
        const text = result.ParsedResults[0].ParsedText.trim();
        setOcrText(text || "Image uploaded, but no text was found.");
        console.log("OCR text:", text || "(empty)");
        const txn = await parseWithGemini(text);
        console.log("Parsed transaction JSON:", txn);
        setTransactionJson(JSON.stringify(txn, null, 2));
      } else {
        setErrorMessage(result.ErrorMessage?.[0] || "OCR Server error.");
      }
    } catch (error) {
      console.error("OCR Error: ", error);
      setErrorMessage("Network error. Please check your internet connection.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const captureImage = useCallback(async () => {
    setErrorMessage(null);

    if (!canUseCamera) {
      setErrorMessage("Camera is not available on web.");
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setErrorMessage("Camera permission is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      const downsizedUri = await downsizeImageTo1MB(uri);
      setImageUri(downsizedUri);
      setTimeout(() => runOcr(downsizedUri), 500);
    }
  }, [canUseCamera, downsizeImageTo1MB, runOcr]);

  const params = useLocalSearchParams();
  const router = useRouter();
  const [autoStarted, setAutoStarted] = useState(false);

  useEffect(() => {
    try {
      if (!autoStarted && params?.start === "camera") {
        // auto-trigger camera when navigated with ?start=camera
        // slight delay to ensure UI is mounted
        setAutoStarted(true);
        setTimeout(() => {
          captureImage();
          // clear the query param so returning to this route doesn't re-trigger
          try {
            router.replace("/ocr");
          } catch (e) {
            // non-fatal
          }
        }, 300);
      }
    } catch (e) {
      console.warn("Auto camera start failed", e);
    }
  }, [params, captureImage]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <View style={styles.headerContent}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.previewImage}
              contentFit="contain"
            />
          ) : (
            <View style={styles.placeholderHeader}>
              <ThemedText>No Image Captured</ThemedText>
            </View>
          )}
        </View>
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Camera OCR</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.captureButton,
            pressed && styles.captureButtonPressed,
            isProcessing && { backgroundColor: "#ccc" },
          ]}
          onPress={captureImage}
          disabled={isProcessing}
        >
          <ThemedText type="defaultSemiBold" style={styles.captureButtonText}>
            {isProcessing ? "Processing..." : "Take Photo"}
          </ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.outputContainer}>
        <ThemedText type="subtitle">Recognized text:</ThemedText>
        {errorMessage ? (
          <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
        ) : (
          <ThemedText style={styles.ocrResultText}>
            {ocrText || "Result will appear here..."}
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.outputContainer}>
        <ThemedText type="subtitle">Parsed transaction (JSON):</ThemedText>
        {transactionJson ? (
          <ThemedText style={styles.ocrResultText}>
            {transactionJson}
          </ThemedText>
        ) : (
          <ThemedText style={styles.ocrResultText}>
            No transaction parsed yet.
          </ThemedText>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

type DBTransaction = {
  title: string;
  subtitle: string;
  amount: number;
  currency: string;
  type: string;
  location: string;
  latitude?: number;
  longitude?: number;
  time: string;
  category: string;
  paymentMethod: string;
  note: string;
  image: string;
  date: string;
};

const parseTransaction = (text: string): DBTransaction => {
  const now = new Date();
  const defaultTime = now.toISOString().slice(11, 16);
  const defaults: DBTransaction = {
    title: "__unrec",
    subtitle: "",
    amount: 0,
    currency: "INR",
    type: "Debit",
    location: "Delhi, India",
    time: defaultTime,
    category: "Other",
    paymentMethod: "Cash",
    note: "",
    image: "",
    date: now.toISOString(),
  };

  const cleaned = (text || "").trim();
  if (!cleaned) {
    return defaults;
  }

  const lines = cleaned
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const joined = lines.join(" ");

  const amountMatch = joined.match(
    /(₹|INR|Rs\.?|\bINR\b)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i,
  );
  const amount = amountMatch
    ? Number((amountMatch[2] || "").replace(/,/g, ""))
    : NaN;

  const altAmountMatch = joined.match(
    /\b(total|amount|paid|debited|credited)\b[^0-9]*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i,
  );
  const altAmount = altAmountMatch
    ? Number((altAmountMatch[2] || "").replace(/,/g, ""))
    : NaN;

  const finalAmount = Number.isFinite(amount)
    ? amount
    : Number.isFinite(altAmount)
      ? altAmount
      : 0;

  const currencyMatch = joined.match(/\b(INR|USD|EUR|GBP|AED|AUD|CAD|SGD)\b/i);
  const currency = currencyMatch ? currencyMatch[1].toUpperCase() : "INR";

  const typeMatch = joined.match(/\b(credited|credit)\b/i)
    ? "Credit"
    : joined.match(/\b(debited|debit|paid|spent|purchase)\b/i)
      ? "Debit"
      : "Debit";

  const timeMatch = joined.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  const time = timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : defaultTime;

  const dateMatch = joined.match(
    /\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b|\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})\b/,
  );
  let isoDate = now.toISOString();
  if (dateMatch) {
    let year: number | null = null;
    let month: number | null = null;
    let day: number | null = null;
    if (dateMatch[1] && dateMatch[2] && dateMatch[3]) {
      year = Number(dateMatch[1]);
      month = Number(dateMatch[2]);
      day = Number(dateMatch[3]);
    } else if (dateMatch[4] && dateMatch[5] && dateMatch[6]) {
      day = Number(dateMatch[4]);
      month = Number(dateMatch[5]);
      year = Number(dateMatch[6]);
      if (year < 100) year += 2000;
    }
    if (year && month && day) {
      const dt = new Date(
        year,
        month - 1,
        day,
        now.getHours(),
        now.getMinutes(),
      );
      isoDate = dt.toISOString();
    }
  }

  const merchantMatch = joined.match(
    /\b(upi|paytm|gpay|google pay|phonepe|amazon|flipkart|uber|ola|swiggy|zomato|starbucks|mcdonald'?s|domino'?s|big bazaar|dmart|reliance|apple|microsoft)\b/i,
  );
  const title = merchantMatch
    ? merchantMatch[1]
        .replace(/\b\w/g, (m) => m.toUpperCase())
        .replace(/\bupi\b/i, "UPI")
    : lines[0] || "__unrec";

  const paymentMethod = joined.match(/\b(upi|gpay|google pay|phonepe|paytm)\b/i)
    ? "UPI"
    : joined.match(/\b(card|visa|mastercard|rupay|amex)\b/i)
      ? "Card"
      : joined.match(/\b(netbanking|bank transfer|imps|neft|rtgs)\b/i)
        ? "Bank Transfer"
        : joined.match(/\b(cash)\b/i)
          ? "Cash"
          : "Cash";

  const category = joined.match(
    /\b(restaurant|cafe|coffee|food|swiggy|zomato)\b/i,
  )
    ? "Food"
    : joined.match(/\b(uber|ola|taxi|metro|bus|train|transport)\b/i)
      ? "Transport"
      : joined.match(
            /\b(amazon|flipkart|shopping|purchase|store|mart|retail)\b/i,
          )
        ? "Shopping"
        : joined.match(/\b(recharge|electricity|water|gas|bill|utilities)\b/i)
          ? "Utilities"
          : "Other";

  const subtitle =
    category === "Food"
      ? "Food & beverages"
      : category === "Transport"
        ? "Travel"
        : category === "Shopping"
          ? "Retail purchase"
          : category === "Utilities"
            ? "Utility payment"
            : "General expense";

  if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
    return defaults;
  }

  return {
    ...defaults,
    title,
    subtitle,
    amount: finalAmount,
    currency,
    type: typeMatch,
    time,
    category,
    paymentMethod,
    note: cleaned.slice(0, 240),
    date: isoDate,
  };
};

const parseWithGemini = async (text: string): Promise<DBTransaction> => {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return parseTransaction(text);
  }

  const now = new Date();
  const defaultTime = now.toISOString().slice(11, 16);

  const prompt = `You are given OCR text. Extract a single financial transaction and return ONLY valid JSON matching this TypeScript interface:
{
  title: string;
  subtitle: string;
  amount: number;
  currency: string;
  type: string;
  location: string;
  latitude?: number;
  longitude?: number;
  time: string;
  category: string;
  paymentMethod: string;
  note: string;
  image: string;
  date: string;
}
Rules:
- Defaults if unknown: currency="INR", location="Delhi, India", type="Debit", paymentMethod="Cash", time="${defaultTime}".
- If not a transaction, set title="__unrec" and use safe defaults.
- Return JSON only, no markdown.

OCR text:
"""
${text}
"""`;

  console.log("Gemini request text:", prompt);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2 },
        }),
      },
    );

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("Gemini response text:", raw || "(empty)");

    const jsonTextMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonTextMatch) {
      return parseTransaction(text);
    }

    const parsed = JSON.parse(jsonTextMatch[0]) as DBTransaction;

    if (!parsed || !parsed.title || typeof parsed.amount !== "number") {
      return parseTransaction(text);
    }

    return {
      title: parsed.title || "__unrec",
      subtitle: parsed.subtitle || "",
      amount: Number.isFinite(parsed.amount) ? parsed.amount : 0,
      currency: parsed.currency || "INR",
      type: parsed.type || "Debit",
      location: parsed.location || "Delhi, India",
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      time: parsed.time || defaultTime,
      category: parsed.category || "Other",
      paymentMethod: parsed.paymentMethod || "Cash",
      note: parsed.note || "",
      image: parsed.image || "",
      date: parsed.date || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Gemini parse error:", error);
    return parseTransaction(text);
  }
};

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  stepContainer: { gap: 8, marginBottom: 16 },
  outputContainer: {
    gap: 8,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
  },
  headerContent: {
    height: 220,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: { height: "100%", width: "100%" },
  placeholderHeader: { height: 200, justifyContent: "center" },
  captureButton: {
    borderRadius: 12,
    backgroundColor: "#2F7CF6",
    paddingVertical: 16,
    alignItems: "center",
  },
  captureButtonPressed: { opacity: 0.8 },
  captureButtonText: { color: "#FFFFFF", fontSize: 18 },
  errorText: { color: "#D9534F" },
  ocrResultText: { fontSize: 16, lineHeight: 24 },
});

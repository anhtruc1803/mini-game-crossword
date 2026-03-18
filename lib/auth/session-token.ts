import { timingSafeEqual } from "crypto";
import { AppError } from "@/lib/security/errors";

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const FALLBACK_DEV_SECRET = "mini-game-dev-session-secret";

type SessionTokenPayload = {
  userId: string;
  email: string;
  exp: number;
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (secret?.trim()) {
    return secret.trim();
  }

  if (process.env.NODE_ENV !== "production") {
    return FALLBACK_DEV_SECRET;
  }

  throw new AppError(
    "Missing SESSION_SECRET environment variable.",
    "session_secret_missing",
    500,
    false
  );
}

function encodeBase64Url(input: string) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(input, "utf8").toString("base64url");
  }

  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(input: string) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(input, "base64url").toString("utf8");
  }

  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const normalized = padded + "=".repeat((4 - (padded.length % 4 || 4)) % 4);
  return atob(normalized);
}

function bytesToBase64Url(bytes: Uint8Array) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64url");
  }

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function signValue(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );

  return bytesToBase64Url(new Uint8Array(signature));
}

export async function createSessionToken(userId: string, email: string) {
  const payload: SessionTokenPayload = {
    userId,
    email,
    exp: Date.now() + SESSION_TTL_MS,
  };

  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = await signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = await signValue(encodedPayload);
  if (
    signature.length !== expectedSignature.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      decodeBase64Url(encodedPayload)
    ) as SessionTokenPayload;

    if (
      !payload.userId ||
      !payload.email ||
      typeof payload.exp !== "number" ||
      payload.exp <= Date.now()
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function hasValidSessionToken(token: string | undefined) {
  const payload = await verifySessionToken(token);
  return payload !== null;
}

export const SESSION_COOKIE = "session_id";
export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;

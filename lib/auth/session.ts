import { cookies } from "next/headers";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  verifySessionToken,
} from "./session-token";

type SessionData = {
  userId: string;
  email: string;
};

export async function createSession(userId: string, email: string): Promise<string> {
  const sessionToken = await createSessionToken(userId, email);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return sessionToken;
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(sessionToken);

  if (!session) {
    return null;
  }

  return {
    userId: session.userId,
    email: session.email,
  };
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

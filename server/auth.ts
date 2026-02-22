/**
 * Minimal auth: session in memory, password hashing via crypto.
 * Cookie: finmodel.sid (signed with HMAC). No new dependencies.
 */
import crypto from "crypto";

const isProduction = process.env.NODE_ENV === "production";
const SESSION_SECRET = process.env.SESSION_SECRET || (isProduction ? "" : "dev-secret-change-in-production");
const COOKIE_NAME = "finmodel.sid";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

if (isProduction && !SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set in production. Add it to your environment.");
}

const sessions = new Map<string, { userId: number; email: string; expires: number }>();

function sign(value: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const computed = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(computed, "hex"));
}

export function createSession(userId: number, email: string): string {
  const id = crypto.randomBytes(24).toString("hex");
  const expires = Date.now() + SESSION_TTL_MS;
  sessions.set(id, { userId, email, expires });
  return id;
}

export function getSession(sessionId: string): { userId: number; email: string } | null {
  const raw = sessions.get(sessionId);
  if (!raw || raw.expires < Date.now()) {
    if (raw) sessions.delete(sessionId);
    return null;
  }
  return { userId: raw.userId, email: raw.email };
}

export function getSessionFromCookie(cookieHeader: string | undefined): { userId: number; email: string } | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const value = match?.[1];
  if (!value) return null;
  const [id, sig] = value.split(".");
  if (!id || !sig || sign(id) !== sig) return null;
  return getSession(id);
}

export function setSessionCookie(sessionId: string): string {
  const sig = sign(sessionId);
  const payload = `${sessionId}.${sig}`;
  const secure = isProduction ? "; Secure" : "";
  return `${COOKIE_NAME}=${payload}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}${secure}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export { COOKIE_NAME };

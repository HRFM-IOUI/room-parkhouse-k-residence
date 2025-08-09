// src/app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function initAdmin() {
  if (admin.apps.length) return;

  const raw =
    process.env.FIREBASE_ADMIN_SDK_KEY_JSON ||
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("MISSING_ADMIN_ENV");

  let jsonStr = raw.trim();
  if (!jsonStr.startsWith("{")) jsonStr = Buffer.from(jsonStr, "utf8").toString();

  let j: any;
  try {
    j = JSON.parse(jsonStr);
  } catch {
    // Base64の可能性
    jsonStr = Buffer.from(raw.trim(), "base64").toString("utf8");
    j = JSON.parse(jsonStr);
  }

  const projectId = j.project_id ?? j.projectId;
  const clientEmail = j.client_email ?? j.clientEmail;
  let privateKey: string | undefined = j.private_key ?? j.privateKey;

  if (typeof privateKey === "string") {
    if (
      (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
      (privateKey.startsWith("'") && privateKey.endsWith("'"))
    ) privateKey = privateKey.slice(1, -1);
    privateKey = privateKey
      .replace(/\\n/g, "\n")
      .replace(/\r\n?/g, "\n")
      .replace(/-+\s*BEGIN\s+PRIVATE\s+KEY\s*-+/i, "-----BEGIN PRIVATE KEY-----")
      .replace(/-+\s*END\s+PRIVATE\s+KEY\s*-+/i, "-----END PRIVATE KEY-----")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  if (!clientEmail) throw new Error("MISSING_CLIENT_EMAIL");
  if (!privateKey?.includes("BEGIN PRIVATE KEY")) throw new Error("INVALID_PRIVATE_KEY_FORMAT");

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

export async function POST(req: NextRequest) {
  try {
    initAdmin();

    const { idToken } = await req.json();
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ ok: false, error: "NO_ID_TOKEN" }, { status: 400 });
    }

    const raw = process.env.ALLOWED_EMAILS ?? process.env.ALLOWED_EMAIL ?? "";
    const allowList = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    if (!allowList.length) {
      return NextResponse.json({ ok: false, error: "SERVER_MISCONFIGURED_NO_ALLOWED_EMAILS" }, { status: 500 });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = decoded.email?.toLowerCase();
    const emailVerified = decoded.email_verified === true;

    if (!email) return NextResponse.json({ ok: false, error: "NO_EMAIL_IN_TOKEN" }, { status: 400 });
    if (!allowList.includes(email)) return NextResponse.json({ ok: false, error: "FORBIDDEN", email }, { status: 403 });

    // ★ セッションクッキー（7日）
    const expiresIn = 7 * 24 * 60 * 60 * 1000;
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    const res = NextResponse.json({ ok: true, email, emailVerified });
    res.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: true,   // 本番ドメインはHTTPS
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(expiresIn / 1000),
    });
    return res;
  } catch (e: any) {
    console.error("LOGIN_API_ERROR", e?.message || e);
    const msg =
      typeof e?.message === "string" &&
      (e.message.includes("ADMIN") || e.message.includes("PRIVATE_KEY") || e.message.includes("MISSING_") || e.message.includes("FORMAT"))
        ? "SERVER_MISCONFIGURED_ADMIN_CREDENTIAL"
        : "SERVER_ERROR";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

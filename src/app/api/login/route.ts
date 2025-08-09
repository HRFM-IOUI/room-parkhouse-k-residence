// src/app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --- firebase-admin 初期化（多重初期化防止） ---
function initAdmin() {
  if (admin.apps.length) return;

  // 両対応：FIREBASE_ADMIN_SDK_KEY_JSON or GOOGLE_SERVICE_ACCOUNT_JSON
  const raw =
    process.env.FIREBASE_ADMIN_SDK_KEY_JSON ||
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!raw) throw new Error("MISSING_ADMIN_ENV");

  // JSONそのまま / Base64 両対応
  let jsonStr = raw.trim();
  if (!jsonStr.startsWith("{")) {
    try {
      jsonStr = Buffer.from(jsonStr, "base64").toString("utf8");
    } catch {
      throw new Error("ADMIN_ENV_NOT_BASE64_OR_JSON");
    }
  }

  // JSON parse（anyで受けて正規化）
  let j: any;
  try {
    j = JSON.parse(jsonStr);
  } catch {
    throw new Error("ADMIN_ENV_INVALID_JSON");
  }

  // スネーク/キャメル両対応で正規化
  const projectId = j.project_id ?? j.projectId;
  const clientEmail = j.client_email ?? j.clientEmail;
  let privateKey: string | undefined = j.private_key ?? j.privateKey;

  if (typeof privateKey === "string") {
    // \n → 実改行
    privateKey = privateKey.replace(/\\n/g, "\n").trim();
  }

  if (!privateKey?.includes("BEGIN PRIVATE KEY")) {
    throw new Error("INVALID_PRIVATE_KEY_FORMAT");
  }
  if (!clientEmail) throw new Error("MISSING_CLIENT_EMAIL");

  const serviceAccount: admin.ServiceAccount = {
    projectId,
    clientEmail,
    privateKey,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  // Functionsログで確認用
  console.log("ADMIN_INIT_OK projectId:", (admin.app().options as any)?.projectId);
}

export async function POST(req: NextRequest) {
  try {
    initAdmin();

    const { idToken } = await req.json();
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ ok: false, error: "NO_ID_TOKEN" }, { status: 400 });
    }

    // 許可メール
    const raw = process.env.ALLOWED_EMAILS ?? process.env.ALLOWED_EMAIL ?? "";
    const allowList = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    if (!allowList.length) {
      return NextResponse.json(
        { ok: false, error: "SERVER_MISCONFIGURED_NO_ALLOWED_EMAILS" },
        { status: 500 },
      );
    }

    // Firebase IDトークン検証
    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = decoded.email?.toLowerCase();
    const emailVerified = decoded.email_verified === true;

    if (!email) {
      return NextResponse.json({ ok: false, error: "NO_EMAIL_IN_TOKEN" }, { status: 400 });
    }
    if (!allowList.includes(email)) {
      return NextResponse.json({ ok: false, error: "FORBIDDEN", email }, { status: 403 });
    }

    // if (!emailVerified) return NextResponse.json({ ok:false, error:"EMAIL_NOT_VERIFIED" }, { status: 403 });

    return NextResponse.json({ ok: true, email, emailVerified });
  } catch (e: any) {
    console.error("LOGIN_API_ERROR", e?.message || e);
    const msg =
      typeof e?.message === "string" &&
      (
        e.message.includes("ADMIN") ||
        e.message.includes("PRIVATE_KEY") ||
        e.message.includes("MISSING_") ||
        e.message.includes("FORMAT")
      )
        ? "SERVER_MISCONFIGURED_ADMIN_CREDENTIAL"
        : "SERVER_ERROR";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// 診断用（GETで admin 初期化確認）
export async function GET() {
  try {
    initAdmin();
    const projectId = (admin.app().options as any)?.projectId;
    return NextResponse.json({ ok: true, projectId });
  } catch (e:any) {
    return NextResponse.json(
      { ok:false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}

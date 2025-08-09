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

  if (!raw) {
    throw new Error("Admin credential env is missing");
  }

  // JSONそのまま or Base64 両対応
  let jsonStr = raw.trim();
  if (!jsonStr.startsWith("{")) {
    try {
      jsonStr = Buffer.from(jsonStr, "base64").toString("utf8");
    } catch {
      throw new Error("Admin credential is not valid Base64 nor JSON");
    }
  }

  let cred: admin.ServiceAccount;
  try {
    cred = JSON.parse(jsonStr);
  } catch {
    throw new Error("Admin credential is invalid JSON");
  }

  admin.initializeApp({
    credential: admin.credential.cert(cred),
  });

  // 参考：Functionsログに出る（projectId確認用）
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
      (e.message.includes("credential") || e.message.includes("SERVICE_ACCOUNT"))
        ? "SERVER_MISCONFIGURED_ADMIN_CREDENTIAL"
        : "SERVER_ERROR";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// src/app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";

export const runtime = "nodejs";

// Admin 初期化（多重初期化防止）
if (!admin.apps.length) {
  const keyJson = process.env.FIREBASE_ADMIN_SDK_KEY_JSON;
  if (!keyJson) {
    console.error("FIREBASE_ADMIN_SDK_KEY_JSON is missing");
  } else {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(keyJson) as admin.ServiceAccount),
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ ok: false, error: "NO_ID_TOKEN" }, { status: 400 });
    }
    if (!admin.apps.length) {
      return NextResponse.json({ ok: false, error: "SERVER_MISCONFIGURED_NO_ADMIN" }, { status: 500 });
    }

    // idToken を検証して email を取得
    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = decoded.email;
    const emailVerified = decoded.email_verified === true;

    if (!email) {
      return NextResponse.json({ ok: false, error: "NO_EMAIL_IN_TOKEN" }, { status: 400 });
    }

    // 許可メール判定
    const raw = process.env.ALLOWED_EMAILS ?? process.env.ALLOWED_EMAIL ?? "";
    const allowList = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    if (!allowList.length) {
      return NextResponse.json({ ok: false, error: "SERVER_MISCONFIGURED_NO_ALLOWED_EMAILS" }, { status: 500 });
    }

    const allowed = allowList.includes(email.toLowerCase());
    if (!allowed) {
      return NextResponse.json({ ok: false, error: "FORBIDDEN", email }, { status: 403 });
    }

    // （必要なら emailVerified を必須に）
    // if (!emailVerified) return NextResponse.json({ ok:false, error:"EMAIL_NOT_VERIFIED" }, { status: 403 });

    return NextResponse.json({ ok: true, email, emailVerified });
  } catch (e) {
    console.error("LOGIN_API_ERROR", e);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}

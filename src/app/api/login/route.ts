import { NextRequest, NextResponse } from "next/server";

let admin: typeof import("firebase-admin") | null = null;
try {
  // サービスアカウントJSONを Vercel 環境変数に入れてる場合のみ Admin を初期化
  const keyJson = process.env.FIREBASE_ADMIN_SDK_KEY_JSON;
  if (keyJson && !("apps" in (await import("firebase-admin")) && (await import("firebase-admin")).apps?.length)) {
    admin = await import("firebase-admin");
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(keyJson) as any),
    });
  }
} catch {
  admin = null;
}

function pickEmailFromBody(body: any): string | null {
  if (!body || typeof body !== "object") return null;
  const candidates = [
    body.email,
    body.user?.email,
    body.data?.email,
    body.credentials?.email,
    body.payload?.email,
  ];
  const found = candidates.find((v) => typeof v === "string" && v.includes("@"));
  return found || null;
}

async function emailFromIdToken(idToken: string): Promise<string | null> {
  try {
    if (!admin) return null;
    const decoded = await admin.auth().verifyIdToken(idToken);
    return typeof decoded.email === "string" ? decoded.email : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1) まず素直に email を拾う
    let email = pickEmailFromBody(body);

    // 2) それでも無ければ idToken から抽出（Admin が初期化されている場合）
    if (!email && typeof body?.idToken === "string") {
      email = await emailFromIdToken(body.idToken);
    }

    if (!email) {
      return NextResponse.json({ ok: false, error: "INVALID_PAYLOAD_NO_EMAIL" }, { status: 400 });
    }

    const raw = process.env.ALLOWED_EMAILS ?? process.env.ALLOWED_EMAIL ?? "";
    const allowList = raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

    const allowed = allowList.includes(email.toLowerCase());
    if (!allowed) {
      return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}

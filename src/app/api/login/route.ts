// src/app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // 明示（任意）

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ ok: false, error: "INVALID_PAYLOAD" }, { status: 400 });
    }

    // Vercel 環境変数（複数可：カンマ区切り）
    // 例: ALLOWED_EMAILS="a@example.com,b@example.com"
    const raw = process.env.ALLOWED_EMAILS ?? process.env.ALLOWED_EMAIL ?? "";
    const allowList = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

    const allowed = allowList.includes(email.toLowerCase());
    if (!allowed) {
      return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    }

    // 必要ならここでセッションCookieを発行する方式にも拡張可（後述）
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}

// （任意）不要メソッドへの応答を明示してもOK
export async function GET() {
  return NextResponse.json({ ok: false, error: "METHOD_NOT_ALLOWED" }, { status: 405 });
}

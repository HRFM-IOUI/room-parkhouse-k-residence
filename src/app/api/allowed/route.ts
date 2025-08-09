// src/app/api/allowed/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ allowed: false }, { status: 400 });
    }

    // Vercel 環境変数（例: "user1@example.com,user2@example.com"）
    const raw = process.env.ALLOWED_EMAILS ?? process.env.ALLOWED_EMAIL ?? "";
    const allowedList = raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const ok = allowedList.includes(email.toLowerCase());

    return NextResponse.json({ allowed: ok }, { status: ok ? 200 : 403 });
  } catch {
    return NextResponse.json({ allowed: false }, { status: 500 });
  }
}

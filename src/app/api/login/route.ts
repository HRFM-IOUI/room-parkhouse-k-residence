import { NextRequest, NextResponse } from "next/server";

type BodyAny = Record<string, any>;

// async 関数の正しい定義（型注釈付き）
async function safeParseJson(req: NextRequest): Promise<BodyAny> {
  try {
    if (req.headers.get("content-type")?.includes("application/json")) {
      return await req.json();
    }
    if (req.headers.get("content-type")?.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      const obj: BodyAny = {};
      form.forEach((v, k) => (obj[k] = v));
      return obj;
    }
    const text = await req.text();
    try {
      return JSON.parse(text);
    } catch {
      return { _raw: text };
    }
  } catch (e) {
    return { _parseError: String(e) };
  }
}

function pickEmail(b: BodyAny): string | null {
  if (!b || typeof b !== "object") return null;
  const candidates = [
    b.email,
    b.user?.email,
    b.data?.email,
    b.credentials?.email,
    b.payload?.email,
  ];
  const found = candidates.find((x) => typeof x === "string" && x.includes("@"));
  return found || null;
}

export async function POST(req: NextRequest) {
  const body = await safeParseJson(req);
  const email = pickEmail(body);

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "INVALID_PAYLOAD_NO_EMAIL", debug: { body } },
      { status: 400 }
    );
  }

  const raw = process.env.ALLOWED_EMAILS ?? process.env.ALLOWED_EMAIL ?? "";
  const allowList = raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

  if (!allowList.length) {
    return NextResponse.json(
      { ok: false, error: "SERVER_MISCONFIGURED_NO_ALLOWED_EMAILS" },
      { status: 500 }
    );
  }

  if (!allowList.includes(email.toLowerCase())) {
    return NextResponse.json({ ok: false, error: "FORBIDDEN", email }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}

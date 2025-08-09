// src/app/api/_diag-admin/route.ts
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!admin.apps.length) {
      const raw =
        process.env.FIREBASE_ADMIN_SDK_KEY_JSON ||
        process.env.GOOGLE_SERVICE_ACCOUNT_JSON ||
        "";
      if (!raw) throw new Error("MISSING_ENV");

      let text = raw.trim();
      if (!text.startsWith("{")) {
        text = Buffer.from(text, "base64").toString("utf8");
      }
      admin.initializeApp({ credential: admin.credential.cert(JSON.parse(text) as any) });
    }
    const projectId = (admin.app().options as any)?.projectId;
    return NextResponse.json({ ok: true, projectId });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e.message || String(e) }, { status: 500 });
  }
}

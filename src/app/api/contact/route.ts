// src/app/api/contact/route.ts
export const runtime = "nodejs"; // Edge不可（googleapisはNode専用）

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

function toBase64Url(str: string) {
  return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function errorToMessage(e: unknown): string {
  if (typeof e === "string") return e;
  if (e instanceof Error) return e.message;
  if (e && typeof e === "object") {
    const resp = (e as { response?: { data?: unknown } }).response;
    if (resp?.data !== undefined) {
      try {
        return typeof resp.data === "string" ? resp.data : JSON.stringify(resp.data);
      } catch {}
    }
  }
  return "Unknown error";
}

export async function POST(req: NextRequest) {
  try {
    const {
      // フロントのフォームと一致
      type,                 // "居住者からの連絡" | "区分所有者からの連絡" | "購入・入居検討" | "仲介・事業者" | "その他"
      resident,             // "居住者" | "非居住者"
      building,             // 任意
      room,                 // 任意
      name,                 // 必須
      email,                // 必須
      emailConfirm,         // 必須（一致チェック）
      message,              // 必須
      agree,                // 必須（true）
      company,              // HoneyPot（画面非表示）
      receivedAt,           // 任意（クライアントから来てもOK）
      site,                 // 任意（"管理組合公式サイト" など）
    } = await req.json();

    // HoneyPot：botは company に値を入れがち → 黙って成功返す
    if (company) {
      return NextResponse.json({ ok: true });
    }

    // 必須バリデーション
    if (!type || !resident || !name || !email || !emailConfirm || !message) {
      return NextResponse.json({ ok: false, error: "REQUIRED_MISSING" }, { status: 400 });
    }
    if (email !== emailConfirm) {
      return NextResponse.json({ ok: false, error: "EMAIL_MISMATCH" }, { status: 400 });
    }
    if (!agree) {
      return NextResponse.json({ ok: false, error: "PRIVACY_NOT_AGREED" }, { status: 400 });
    }

    // 環境変数（VercelのProject Settingsに登録）
    const user = process.env.GMAIL_USER;
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

    if (!user || !clientId || !clientSecret || !refreshToken) {
      console.error("ENV MISSING", {
        user: !!user,
        clientId: !!clientId,
        clientSecret: !!clientSecret,
        refreshToken: !!refreshToken,
      });
      return NextResponse.json({ ok: false, error: "SERVER_ENV_MISSING" }, { status: 500 });
    }

    // OAuth2
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
    oauth2.setCredentials({ refresh_token: refreshToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2 });

    // 件名（日本語はMIMEエンコード）
    const subjectRaw = `【管理組合お問い合わせ】${type} / ${resident}`;
    const encodedSubject = `=?UTF-8?B?${Buffer.from(subjectRaw, "utf8").toString("base64")}?=`;

    // 本文
    const lines = [
      `サイト: ${site || "管理組合公式サイト"}`,
      `受付日時: ${receivedAt || new Date().toISOString()}`,
      ``,
      `【種別】${type}`,
      `【居住者区分】${resident}`,
      building ? `【棟】${building}` : "",
      room ? `【号室】${room}` : "",
      `【お名前】${name}`,
      `【メール】${email}`,
      ``,
      `--- お問い合わせ内容 ---`,
      message,
      ``,
      `（このメールはサイトのフォームから自動送信されています）`,
    ].filter(Boolean);

    const raw =
      `From: "管理組合お問い合わせ" <${user}>\r\n` +
      `To: ${user}\r\n` +
      `Subject: ${encodedSubject}\r\n` +
      `MIME-Version: 1.0\r\n` +
      `Content-Type: text/plain; charset="UTF-8"\r\n` +
      `Content-Transfer-Encoding: 7bit\r\n\r\n` +
      lines.join("\n");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: toBase64Url(raw) },
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Gmail API 送信エラー:", errorToMessage(err));
    return NextResponse.json({ ok: false, error: "MAIL_SEND_FAILED" }, { status: 500 });
  }
}

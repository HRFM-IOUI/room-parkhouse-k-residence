// functions/src/index.ts
import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import OpenAI from "openai";
import { randomUUID } from "crypto";

if (admin.apps.length === 0) admin.initializeApp();

// 共通ユーティリティ
const ymStr = (d = new Date()) => d.toISOString().slice(0, 7); // "YYYY-MM"

/** 1) 入室コード検証 → セッショントークン発行 */
export const verifyLegalCode = onCall({ region: "asia-northeast1" }, async (req) => {
  const code = String(req.data?.code || "").trim();
  if (!code) throw new HttpsError("invalid-argument", "code is required");

  const ym = ymStr();
  const snap = await admin.firestore().doc(`legal_ai_codes/${ym}`).get();
  if (!snap.exists) throw new HttpsError("failed-precondition", "code not set");

  const { code: expected, validUntil } = snap.data() as any;
  const now = Date.now();
  if (String(expected) !== code) throw new HttpsError("permission-denied", "invalid code");
  if (validUntil?.toMillis && validUntil.toMillis() < now) {
    throw new HttpsError("deadline-exceeded", "code expired");
  }

  const token = `${randomUUID()}-${now}`;
  await admin.firestore().doc(`legal_ai_sessions/${token}`).set({
    exp: now + 24 * 60 * 60 * 1000, // 24h
    issuedAt: now,
  });

  return { token };
});

/** 2) 月間回数の消費（上限チェック） */
export const consumeLegalUsage = onCall({ region: "asia-northeast1" }, async () => {
  const ym = ymStr();
  const ref = admin.firestore().doc(`legal_ai_usage/${ym}`);

  await admin.firestore().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const base = snap.exists ? (snap.data() as any) : { limit: 5, count: 0 };
    const limit = Number(base.limit ?? 5);
    const count = Number(base.count ?? 0);
    if (count >= limit) {
      throw new HttpsError("resource-exhausted", "monthly limit reached");
    }
    tx.set(ref, { limit, count: count + 1, lastUsedAt: Date.now() }, { merge: true });
  });

  return { ok: true };
});

/** 3) 法務AI応答（監査ログ保存はしない） */
export const askLegal = onCall(
  { region: "asia-northeast1", secrets: ["OPENAI_API_KEY"] },
  async (req) => {
    const question = String(req.data?.question || "").trim();
    if (!question) throw new HttpsError("invalid-argument", "question is required");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new HttpsError("failed-precondition", "OPENAI_API_KEY not set");

    const openai = new OpenAI({ apiKey });

    const sys =
      "あなたは日本の不動産・建築関連の法務補助AIです。" +
      "建築基準法・宅地建物取引業法・都市計画法・東京都条例を参照し、" +
      "必ず日本語で「結論→根拠条文（法律名・条番号・短い引用）→解説→交渉の論点→留意（最終判断は弁護士確認）」の順で簡潔に出力してください。";

    try {
      const resp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: `質問: """${question}"""` },
        ],
      });

      const answer = resp.choices?.[0]?.message?.content ?? "回答を生成できませんでした。";
      return { answer, cites: [] };
    } catch (e: any) {
      const msg = typeof e?.message === "string" ? e.message : "OpenAI request failed";
      throw new HttpsError("internal", msg);
    }
  }
);

/** 4) 当月レポートへの保存（PDF化用の元データ） */
export const saveLegalEntry = onCall({ region: "asia-northeast1" }, async (req) => {
  const q = String(req.data?.question || "").trim();
  const a = String(req.data?.answer || "").trim();
  if (!q || !a) throw new HttpsError("invalid-argument", "question/answer required");

  const ym = ymStr();
  await admin
    .firestore()
    .collection("legal_ai_reports")
    .doc(ym)
    .collection("entries")
    .add({ q, a, at: Date.now() });

  return { ok: true };
});

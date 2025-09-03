"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
// 既存の Firebase 初期化を流用（副作用 import。未使用警告は無視してOK）
import "@/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";

export default function LegalAiLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setErr(null);

    try {
      // ※ Functions のリージョンを東京等にしている場合は:
      // const fn = httpsCallable(getFunctions(undefined, "asia-northeast1"), "verifyLegalCode");
      const fn = httpsCallable(getFunctions(undefined, "asia-northeast1"), "verifyLegalCode");
      const res: any = await fn({ code: code.trim() });

      // token が返る想定（verifyLegalCode 側の実装に準拠）
      const token: string | undefined = res?.data?.token;
      if (token) {
        // httpOnly ではないが最小実装としてクッキーに保存（有効期限は 1日）
        document.cookie =
          `legal_ai_session=${token}; Path=/; Max-Age=${60 * 60 * 24}; Secure; SameSite=Strict`;
      }

      router.push("/legal-ai");
    } catch (e: any) {
      // Firebase HttpsError の message をそのまま表示（日本語化はサーバ側でも可）
      const msg: string = e?.message || "認証に失敗しました。時間をおいて再度お試しください。";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-[70vh] flex items-start sm:items-center justify-center px-4 pb-16 pt-10 sm:pt-20"
      style={{ background: "linear-gradient(120deg,#faf8ef 0%,#f5ecd8 85%,#ece1c4 100%)" }}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white/90 border shadow-[0_12px_50px_rgba(180,150,70,.18)]"
        style={{ borderColor: "#e7ddc5" }}
      >
        {/* ヘッダ */}
        <div className="px-6 sm:px-8 pt-6">
          <h1 className="text-[18px] font-bold tracking-wide" style={{ color: "#7f6b39" }}>
            法務AIロボット 入室コード
          </h1>
          <p className="mt-1 text-[12px]" style={{ color: "#7b7361" }}>
            理事会・検討委員会向け専用。第三者への共有は禁止されています。
          </p>
        </div>

        {/* フォーム */}
        <form onSubmit={submit} className="px-6 sm:px-8 py-6 space-y-4">
          <div>
            <label className="block text-[13px] font-bold mb-1" style={{ color: "#7f6b39" }}>
              今月の入室コード
            </label>
            <input
              inputMode="text"
              autoComplete="one-time-code"
              placeholder="例）ABCD-1234"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-xl border bg-white/95 px-4 py-3 outline-none text-[15px]"
              style={{ borderColor: "#e3d7b8", color: "#333" }}
            />
          </div>

          {/* 注意文 */}
          <div
            className="text-[12px] px-3 py-2 rounded-lg border"
            style={{ color: "#7b7361", borderColor: "#efe6cf", background: "#fffdf6" }}
          >
            月替わりコードは毎月末で無効化されます。入力内容は送信前に必ずご確認ください。
          </div>

          {/* エラー */}
          {err && (
            <div
              className="text-[13px] px-3 py-2 rounded-lg border"
              style={{ color: "#9b2c2c", borderColor: "#f2d6d5", background: "#fff5f5" }}
              role="alert"
            >
              {err}
            </div>
          )}

          {/* 送信ボタン */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => history.back()}
              className="rounded-full px-4 py-2 border"
              style={{ borderColor: "#dfc68e", color: "#7f6b39", background: "#ffffff" }}
            >
              戻る
            </button>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="rounded-full px-5 py-2 font-bold transition disabled:opacity-60"
              style={{
                background: loading ? "#d2c4a2" : "#fff7d7",
                color: "#7f6b39",
                border: "1px solid #e8dab3",
              }}
              aria-label="入室"
            >
              {loading ? "確認中…" : "入室"}
            </button>
          </div>

          {/* フッタ注意 */}
          <p className="text-[11px] mt-3" style={{ color: "#7b7361" }}>
            
          </p>
        </form>
      </div>
    </main>
  );
}

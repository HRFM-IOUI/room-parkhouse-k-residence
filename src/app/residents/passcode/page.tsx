// src/app/residents/passcode/page.tsx
"use client";

import Head from "next/head";
import React, { useEffect, useMemo, useState } from "react";
import { db } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

type FormState = {
  name: string;
  unit: string;       // 号室
  email: string;
};

const brandFont = '"Playfair Display", "Noto Serif JP", serif';

function generateCode(len = 6) {
  const digits = "0123456789";
  let out = "";
  if (typeof window !== "undefined" && (window.crypto as any)?.getRandomValues) {
    const arr = new Uint32Array(len);
    window.crypto.getRandomValues(arr);
    for (let i = 0; i < len; i++) out += digits[arr[i] % 10];
  } else {
    for (let i = 0; i < len; i++) out += digits[Math.floor(Math.random() * 10)];
  }
  // 先頭が0になりうるのでパディングは不要（そのまま6桁表示）
  return out;
}

export default function ResidentsPasscodePage() {
  const [form, setForm] = useState<FormState>({ name: "", unit: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [issuedCode, setIssuedCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // シンプル・レート制限（ローカル）：1回/10分
  const canRequest = useMemo(() => {
    if (typeof window === "undefined") return true;
    const last = localStorage.getItem("passcode_last_request_at");
    if (!last) return true;
    const diff = Date.now() - Number(last);
    return diff > 10 * 60 * 1000; // 10分
  }, []);

  useEffect(() => {
    setError(null);
  }, [form.name, form.unit, form.email]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 最低限のバリデーション
    if (!form.name.trim() || !form.unit.trim() || !form.email.trim()) {
      setError("お名前・号室・メールアドレスを入力してください。");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("メールアドレスの形式が正しくありません。");
      return;
    }
    if (!canRequest) {
      setError("短時間に複数の発行はできません。しばらく経ってから再度お試しください。");
      return;
    }

    setSubmitting(true);
    try {
      const code = generateCode(6);
      const exp = new Date(Date.now() + 30 * 60 * 1000); // 30分後

      await addDoc(collection(db, "passcodes"), {
        code,              // 本番はハッシュ保存推奨（例：SHA-256）
        unit: form.unit,
        name: form.name,
        email: form.email.toLowerCase(),
        createdAt: serverTimestamp(),
        expiresAt: exp,    // Firestore 上は Timestamp に自動変換
        used: false,
        channel: "web",    // どこから発行したかのメモ
      });

      setIssuedCode(code);
      setExpiresAt(exp);
      setShowCode(true);

      if (typeof window !== "undefined") {
        localStorage.setItem("passcode_last_request_at", String(Date.now()));
      }
    } catch (e) {
      setError("発行に失敗しました。通信環境をご確認の上、もう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", unit: "", email: "" });
    setIssuedCode(null);
    setExpiresAt(null);
    setShowCode(false);
    setError(null);
  };

  const copyCode = async () => {
    if (!issuedCode) return;
    try {
      await navigator.clipboard.writeText(issuedCode);
      alert("パスコードをコピーしました。");
    } catch {
      // フォールバック
      const ta = document.createElement("textarea");
      ta.value = issuedCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      alert("パスコードをコピーしました。");
    }
  };

  return (
    <>
      <Head>
        <title>居住者パスコード発行 | The Parkhouse Kamishakujii Residence</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main
        className="min-h-[70vh] w-full bg-gradient-to-br from-[#faf8ef] via-[#f5f0e2] to-[#ece1c4] py-12 sm:py-16"
      >
        <div className="max-w-[960px] w-[92%] sm:w-[88%] mx-auto">
          {/* ヘッダー */}
          <div className="mb-8 sm:mb-12">
            <h1
              className="text-[1.8rem] sm:text-[2.2rem] font-extrabold text-[#7f6b39] tracking-wide"
              style={{ fontFamily: brandFont }}
            >
              居住者パスコード発行
            </h1>
            <p className="mt-2 text-[#786e56]">
              ログインに必要な6桁のパスコードを発行します（有効期限：発行から30分）。
            </p>
          </div>

          {/* カード */}
          <div
            className="rounded-3xl bg-white/90 border border-[#e7ddc5] shadow-[0_12px_40px_rgba(180,150,70,.12)] p-6 sm:p-8"
          >
            {/* フォーム or 結果 */}
            {!issuedCode ? (
              <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-1">
                  <label className="block text-sm font-semibold text-[#7f6b39] mb-1">お名前</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-[#e3d7b8] bg-white/95 px-4 py-3 outline-none text-[#333]"
                    placeholder="例）上石 神井"
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-sm font-semibold text-[#7f6b39] mb-1">号室</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-[#e3d7b8] bg-white/95 px-4 py-3 outline-none text-[#333]"
                    placeholder="例）A-123"
                    value={form.unit}
                    onChange={(e) => setForm((s) => ({ ...s, unit: e.target.value }))}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-[#7f6b39] mb-1">メールアドレス</label>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-[#e3d7b8] bg-white/95 px-4 py-3 outline-none text-[#333]"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  />
                </div>

                {error && (
                  <div className="sm:col-span-2">
                    <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
                      {error}
                    </div>
                  </div>
                )}

                <div className="sm:col-span-2 mt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center rounded-xl
                               bg-gradient-to-br from-[#fff5cf] to-[#f7e39a]
                               text-[#6c5a27] font-bold px-6 py-3 border border-[#ead694]
                               hover:brightness-105 transition disabled:opacity-60"
                  >
                    {submitting ? "発行中…" : "パスコードを発行"}
                  </button>
                  {!canRequest && (
                    <span className="text-sm text-[#7b6f54]">
                      ※ 短時間に複数の発行はできません。しばらくお待ちください。
                    </span>
                  )}
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-[#7f6b39] font-semibold">発行されたパスコード</div>
                    <div className="mt-1">
                      <span
                        className="inline-flex items-center tracking-[0.22em]
                                   text-[1.9rem] sm:text-[2.2rem] font-extrabold
                                   rounded-2xl px-4 py-2 bg-[#fff8dd] border border-[#ecd98b] text-[#2a2a2a]"
                        aria-live="polite"
                      >
                        {showCode ? issuedCode : "••••••"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setShowCode((v) => !v)}
                      className="rounded-xl px-4 py-2 border border-[#ead694] bg-white hover:bg-[#fff6e3] text-[#6c5a27] font-semibold transition"
                    >
                      {showCode ? "隠す" : "表示する"}
                    </button>
                    <button
                      onClick={copyCode}
                      className="rounded-xl px-4 py-2 border border-[#ead694] bg-white hover:bg-[#fff6e3] text-[#6c5a27] font-semibold transition"
                    >
                      コピー
                    </button>
                  </div>
                </div>

                <div className="text-[#6b624a]">
                  有効期限：
                  <span className="font-semibold">
                    {expiresAt ? expiresAt.toLocaleString() : "-"}
                  </span>{" "}
                  （発行から30分）
                </div>

                <div className="text-[#6b624a]">
                  次のステップ：
                  <ol className="list-decimal ml-5 mt-1 space-y-1">
                    <li>ログインページへ進む</li>
                    <li>メールアドレスと上記の6桁コードを入力</li>
                  </ol>
                </div>

                <div className="flex gap-3 pt-2">
                  <a
                    href="/login"
                    className="inline-flex items-center justify-center rounded-xl
                               bg-gradient-to-br from-[#fff5cf] to-[#f7e39a]
                               text-[#6c5a27] font-bold px-6 py-3 border border-[#ead694]
                               hover:brightness-105 transition"
                  >
                    ログインへ
                  </a>
                  <button
                    onClick={resetForm}
                    className="rounded-xl px-6 py-3 border border-[#ead694] bg-white hover:bg-[#fff6e3] text-[#6c5a27] font-semibold transition"
                  >
                    もう一度発行する
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 注意書き */}
          <p className="mt-6 text-xs text-[#847b60]/80">
            ※ 開発用途の簡易実装です。本番運用ではパスコードのハッシュ保存・再発行制限・IP/端末のレート制限、
            発行・検証ロジックのサーバーサイド化（Cloud Functions / Server Actions）をご検討ください。
          </p>
        </div>
      </main>
    </>
  );
}

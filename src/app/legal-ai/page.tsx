// src/app/legal-ai/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "@/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query as fsQuery,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";

const COL = {
  bgGrad: "linear-gradient(120deg,#faf8ef 0%,#f5ecd8 85%,#ece1c4 100%)",
  textMain: "#7f6b39",
  border: "#e7ddc5",
  subText: "#7b7361",
};

function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const key = encodeURIComponent(name) + "=";
  const hit = document.cookie.split("; ").find((row) => row.startsWith(key));
  return hit ? decodeURIComponent(hit.slice(key.length)) : "";
}

const TEMPLATE = `【案件名】
【背景事実】（場所／用途地域／敷地・建物条件／関係者）
【確認したいこと（3〜5項目）】
- 例：日影規制の適用と閾値
- 例：都条例の追加要件
【関連資料URL/添付】
【想定条文】（例：建築基準法56条の2 など）
【希望アウトプット】（結論→根拠条文→交渉論点→留意）
【前提／制約】`;

type Entry = {
  id: string;
  q: string;
  a: string;
  at: number; // epoch millis
};

// 安全にテキストをHTMLへ流し込むためのエスケープ
function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default function LegalAiPage() {
  const router = useRouter();

  const [used, setUsed] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  const [q, setQ] = useState("");
  const [a, setA] = useState<string>("");

  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | undefined>();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const ym = useMemo(() => new Date().toISOString().slice(0, 7), []);

  // gate
  useEffect(() => {
    const token = getCookie("legal_ai_session");
    if (!token) router.replace("/legal-ai/login");
  }, [router]);

  // usage
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "legal_ai_usage", ym));
        const data: any = snap.exists() ? snap.data() : { limit: 5, count: 0 };
        setLimit(Number(data.limit ?? 5));
        setUsed(Number(data.count ?? 0));
      } catch {}
    })();
  }, [ym]);

  // monthly entries
  async function loadEntries() {
    const colRef = collection(db, "legal_ai_reports", ym, "entries");
    const q = fsQuery(colRef, orderBy("at", "desc"));
    const snap = await getDocs(q);
    const rows: Entry[] = snap.docs.map((d) => {
      const x: any = d.data();
      return {
        id: d.id,
        q: String(x.q || ""),
        a: String(x.a || ""),
        at:
          typeof x.at === "number"
            ? x.at
            : x.at?.toMillis?.() ?? Date.now(),
      };
    });
    setItems(rows);
  }
  useEffect(() => {
    loadEntries();
  }, [ym]);

  const openConfirm = () => {
    if (!q.trim()) return;
    setConfirmOpen(true);
  };

  const ask = async () => {
    setConfirmOpen(false);
    setLoading(true);
    setErr(undefined);
    setA("");

    try {
      const funcs = getFunctions(undefined, "asia-northeast1");

      // 1) 使用回数消費
      await httpsCallable(funcs, "consumeLegalUsage")({});

      // 2) 回答生成
      const res: any = await httpsCallable(funcs, "askLegal")({
        question: q,
      });
      const answer = String(res?.data?.answer || "");
      setA(answer);

      // 3) 当月レポートへ保存
      await httpsCallable(funcs, "saveLegalEntry")({
        question: q,
        answer,
      });

      // 4) 使用状況/一覧更新
      const us = await getDoc(doc(db, "legal_ai_usage", ym));
      const udata: any = us.exists() ? us.data() : { limit: 5, count: 0 };
      setLimit(Number(udata.limit ?? 5));
      setUsed(Number(udata.count ?? 0));
      await loadEntries();
    } catch (e: any) {
      setErr(e?.message || "送信に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const insertTemplate = () => {
    if (q.trim()) return;
    setQ(TEMPLATE);
  };

  const limitReached = used >= limit;

  // PDF 生成（保存済み items が無ければ直近の q/a を対象にするフォールバック）
  const makePdf = async () => {
    // 出力対象データ決定
    const dataset =
      items.length > 0
        ? items
        : a?.trim()
        ? [{ id: "temp", q, a, at: Date.now() }]
        : [];

    if (dataset.length === 0) {
      alert("出力対象がありません。先に質問・回答を作成してください。");
      return;
    }

    // 画面を汚さない非表示DOMでレイアウト
    const wrap = document.createElement("div");
    wrap.style.position = "fixed";
    wrap.style.left = "-10000px";
    wrap.style.top = "0";
    wrap.style.width = "794px"; // A4相当幅（px）
    wrap.style.padding = "24px";
    wrap.style.background = "#ffffff";
    wrap.innerHTML = `
      <div style="font-family:system-ui,-apple-system,'Noto Sans JP',sans-serif;color:#222">
        <h1 style="font-size:18px;margin:0 0 8px">当月の記録 ${ym}</h1>
        <div style="font-size:11px;color:#666;margin-bottom:16px">
          ※ 出力内容は<strong>当月内のみ保存</strong>されます。翌月に自動リセット。印刷またはPDF保存をお忘れなく。
        </div>
        ${dataset
          .map((it, idx) => {
            const no = dataset.length - idx;
            return `
              <div style="border:1px solid #e5d9b5;border-radius:12px;padding:16px;margin-bottom:12px;">
                <div style="font-size:11px;color:#666;margin-bottom:6px">#${no} ・ ${escapeHtml(
                  fmt(it.at)
                )}</div>
                <div style="font-weight:700;margin-bottom:6px;color:#7f6b39">■ 質問</div>
                <pre style="white-space:pre-wrap;font-size:12px;margin:0 0 10px">${escapeHtml(
                  it.q
                )}</pre>
                <div style="font-weight:700;margin-bottom:6px;color:#7f6b39">■ 回答</div>
                <pre style="white-space:pre-wrap;font-size:12px;margin:0">${escapeHtml(
                  it.a
                )}</pre>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
    document.body.appendChild(wrap);

    const [{ jsPDF }, html2canvas] = await Promise.all([
      import("jspdf"),
      import("html2canvas").then((m) => m.default),
    ]);

    const canvas = await html2canvas(wrap, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    document.body.removeChild(wrap);

    const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 32;

    const imgW = pageW - margin * 2;
    const imgH = (canvas.height * imgW) / canvas.width;

    let heightLeft = imgH;
    let position = margin;

    const img = canvas.toDataURL("image/png");
    pdf.addImage(img, "PNG", margin, position, imgW, imgH);
    heightLeft -= pageH - margin * 2;

    while (heightLeft > 0) {
      pdf.addPage();
      position = margin - (imgH - heightLeft);
      pdf.addImage(img, "PNG", margin, position, imgW, imgH);
      heightLeft -= pageH - margin * 2;
    }

    pdf.save(`LEX-K_${ym}.pdf`);
  };

  const fmt = (ms: number) => {
    const d = new Date(ms);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}.${m}.${da} ${hh}:${mm}`;
  };

  return (
    <main className="min-h-[70vh] pb-16" style={{ background: COL.bgGrad }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        {/* ヘッダー */}
        <header
          className="rounded-3xl border bg-white/90 px-5 sm:px-7 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: COL.border }}
        >
          <div>
            <h1
              className="text-[18px] sm:text-[20px] font-bold"
              style={{ color: COL.textMain }}
            >
              法務AI：LEX-K（委員会専用）
            </h1>
            <p
              className="text-[12px] sm:text-[13px]"
              style={{ color: COL.subText }}
            >
              建築基準法・宅建業法・都市計画法・東京都条例を参照。最終判断は弁護士確認。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="px-2 py-1 rounded bg-black text-white">
              今月 {used} / {limit} 回
            </span>
            <button
              type="button"
              onClick={makePdf}
              className="px-3 py-1.5 rounded border font-bold"
              style={{
                borderColor: "#e8dab3",
                color: COL.textMain,
                background: "#fff7d7",
              }}
              aria-label="当月の記録をPDF保存"
              title="当月の記録をPDF保存"
            >
              PDFで保存
            </button>
          </div>
        </header>

        {/* フォーム */}
        <section
          className="mt-6 rounded-3xl border bg-white/95 p-5 sm:p-7"
          style={{ borderColor: COL.border }}
        >
          <div className="flex items-center justify-between">
            <label
              className="text-[14px] font-bold"
              style={{ color: COL.textMain }}
            >
              質問（1回＝1送信）
            </label>
            <button
              type="button"
              onClick={insertTemplate}
              className="text-[12px] underline underline-offset-2"
              style={{ color: COL.textMain }}
            >
              テンプレ挿入
            </button>
          </div>

          <textarea
            value={q}
            onChange={(e) => setQ(e.target.value)}
            rows={8}
            className="mt-2 w-full rounded-xl border px-4 py-3 text-[14px] outline-none"
            style={{ borderColor: "#e3d7b8", color: "#333" }}
            placeholder="案件名・背景・確認事項（箇条書き）・資料URL を1回でまとめて入力"
          />

          <div
            className="mt-3 text-[12px] px-3 py-2 rounded-lg border"
            style={{
              color: COL.subText,
              borderColor: "#efe6cf",
              background: "#fffdf6",
            }}
          >
            送信前に内容をご確認ください。送信すると今月の利用回数を<strong>1回消費</strong>します。
          </div>

          {err && (
            <div
              className="mt-3 text-[13px] px-3 py-2 rounded-lg border"
              style={{
                color: "#9b2c2c",
                borderColor: "#f2d6d5",
                background: "#fff5f5",
              }}
              role="alert"
            >
              {err}
            </div>
          )}

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/legal-ai/login")}
              className="rounded-full px-4 py-2 border"
              style={{
                borderColor: "#dfc68e",
                color: COL.textMain,
                background: "#ffffff",
              }}
            >
              入室コードを再入力
            </button>
            <button
              type="button"
              onClick={() => !limitReached && openConfirm()}
              disabled={loading || !q.trim() || limitReached}
              className="rounded-full px-5 py-2 font-bold transition disabled:opacity-60"
              style={{
                background: "#fff7d7",
                color: COL.textMain,
                border: "1px solid #e8dab3",
              }}
            >
              {loading ? "回答生成中…" : "質問する"}
            </button>
          </div>

          {/* スピナー（回答生成中） */}
          {loading && (
            <div
              className="mt-6 flex items-center gap-3 rounded-xl border p-4 bg-white"
              style={{ borderColor: COL.border }}
              aria-live="polite"
              aria-busy="true"
            >
              <span
                className="inline-block w-5 h-5 rounded-full border-2 border-[#e8dab3] border-t-transparent animate-spin"
                aria-hidden="true"
              />
              <div className="text-[13px]" style={{ color: COL.subText }}>
                🤖 エージェントが回答を出力中です… 少しお待ちください。
              </div>
            </div>
          )}

          {a && (
            <div
              className="mt-6 whitespace-pre-wrap rounded-xl border p-4 bg-white"
              style={{ borderColor: COL.border }}
              aria-live="polite"
            >
              {a}
              <div className="mt-3 text-[12px]" style={{ color: COL.subText }}>
                ※ 本回答はAIの解説です。最終判断は弁護士の確認に従ってください。
              </div>
            </div>
          )}

          {!a && limitReached && (
            <div
              className="mt-6 text-[13px] px-3 py-2 rounded-lg border"
              style={{
                color: COL.subText,
                borderColor: "#efe6cf",
                background: "#fffdf6",
              }}
            >
              今月の上限に達しました。次回の委員会までお待ちください。
            </div>
          )}
        </section>

        {/* 当月の記録（PDF保存時は別の非表示DOMを使うので、ここはそのまま） */}
        <section
          id="report-area"
          className="mt-6 rounded-3xl border bg-white p-5 sm:p-7"
          style={{ borderColor: COL.border }}
        >
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <h2 className="text-[16px] font-bold" style={{ color: COL.textMain }}>
              当月の記録（{ym}）
            </h2>
            <p className="text-[12px]" style={{ color: COL.subText }}>
              ※ 出力内容は<strong>当月内のみ保存</strong>されます。翌月に自動リセットされます。印刷またはPDF保存をお忘れなく。
            </p>
          </div>

          {items.length === 0 ? (
            <div className="mt-3 text-[13px]" style={{ color: COL.subText }}>
              まだ今月の記録はありません。
            </div>
          ) : (
            <ol className="mt-4 space-y-5">
              {items.map((it, idx) => (
                <li
                  key={it.id}
                  className="rounded-xl border p-4"
                  style={{ borderColor: "#efe6cf" }}
                >
                  <div className="text-[12px] mb-2" style={{ color: COL.subText }}>
                    #{items.length - idx} ・ {fmt(it.at)}
                  </div>
                  <div className="text-[13px]">
                    <div className="font-bold mb-1" style={{ color: COL.textMain }}>
                      ■ 質問
                    </div>
                    <pre className="whitespace-pre-wrap">{it.q}</pre>
                  </div>
                  <div className="text-[13px] mt-3">
                    <div className="font-bold mb-1" style={{ color: COL.textMain }}>
                      ■ 回答
                    </div>
                    <pre className="whitespace-pre-wrap">{it.a}</pre>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* 送信確認モーダル */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setConfirmOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              className="relative bg-white rounded-3xl shadow-xl w-[92%] max-w-md p-6 border"
              style={{ borderColor: COL.border }}
            >
              <h2
                className="text-lg font-semibold mb-2"
                style={{ color: COL.textMain }}
              >
                送信しますか？
              </h2>
              <p className="text-sm mb-4" style={{ color: COL.subText }}>
                この操作で<strong>今月の利用回数を1回消費</strong>します。内容に不足がないかご確認ください。
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="px-4 py-2 rounded border"
                  style={{ borderColor: "#dfc68e", color: COL.textMain }}
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={ask}
                  className="px-4 py-2 rounded font-bold"
                  style={{
                    background: "#fff7d7",
                    color: COL.textMain,
                    border: "1px solid #e8dab3",
                  }}
                >
                  送信する
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

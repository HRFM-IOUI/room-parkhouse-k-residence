// src/app/archive/page.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { FaFilePdf, FaFileImage, FaDownload, FaRegEye, FaChevronDown, FaSearch } from "react-icons/fa";
import { db } from "@/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import NextImage from "next/image";

// 表示カテゴリ順
const CATEGORIES = ["管理組合", "理事会", "検討委員会", "暮らしと防災", "管理室"];

type ArchiveItem = {
  id: string;
  category: string;
  title: string;
  url: string;
  type: "pdf" | "img";
  thumbnail?: string;
  createdAt?: any; // Firestore Timestamp | string | Date
  _date?: Date;    // 取得時に補完
  _fy?: string;    // "2025年度" など
};

type SortKey = "new" | "old" | "title";

export default function ArchivePage() {
  const [openFY, setOpenFY] = useState<string | null>(null); // 年度アコーディオン
  const [openCat, setOpenCat] = useState<Record<string, number | null>>({}); // 年度ごとにカテゴリ開閉
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 検索・並び替え
  const [qText, setQText] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("new");

  // PDFプレビュー用モーダル
  const [pdfPreview, setPdfPreview] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const qRef = query(collection(db, "archives"), orderBy("createdAt", "desc"));
      const snap = await getDocs(qRef);
      const list: ArchiveItem[] = snap.docs.map((doc) => {
        const d = doc.data() as Omit<ArchiveItem, "id" | "_date" | "_fy"> & { createdAt?: any };
        const date =
          (d.createdAt?.toDate?.() as Date | undefined) ??
          (typeof d.createdAt === "string" ? new Date(d.createdAt) : undefined) ??
          undefined;
        return { id: doc.id, ...d, _date: date, _fy: toFiscalYear(date) };
      });
      setItems(list);
      setLoading(false);

      // 初期開閉：最新年度を開く
      const latestFY = list.find(i => i._fy)?. _fy || currentFiscalYear();
      setOpenFY(latestFY);
      setOpenCat(prev => ({ ...prev, [latestFY]: 0 }));
    })();
  }, []);

  // 検索・並び替え適用
  const filteredSorted = useMemo(() => {
    const qLower = qText.trim().toLowerCase();
    let arr = items.filter(i => !qLower || i.title.toLowerCase().includes(qLower));
    switch (sortBy) {
      case "new":
        arr = [...arr].sort((a, b) => (b._date?.getTime() ?? 0) - (a._date?.getTime() ?? 0));
        break;
      case "old":
        arr = [...arr].sort((a, b) => (a._date?.getTime() ?? 0) - (b._date?.getTime() ?? 0));
        break;
      case "title":
        arr = [...arr].sort((a, b) => a.title.localeCompare(b.title, "ja"));
        break;
    }
    return arr;
  }, [items, qText, sortBy]);

  // 年度 → カテゴリの2段グルーピング
  const fyGroups = useMemo(() => {
    const m = new Map<string, { name: string; cats: { name: string; items: ArchiveItem[] }[] }>();
    for (const fy of unique(filteredSorted.map(i => i._fy || "年度不明")).sort((a, b) => b.localeCompare(a))) {
      const cats = CATEGORIES.map(cat => ({
        name: cat,
        items: filteredSorted.filter(i => (i._fy || "年度不明") === fy && i.category === cat),
      }));
      m.set(fy, { name: fy, cats });
    }
    return Array.from(m.values());
  }, [filteredSorted]);

  function unique<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
  }

  // サムネ or アイコン
  function getFileIcon(item: ArchiveItem) {
    const style = {
      objectFit: "contain" as const,
      borderRadius: 10,
      background: "#fff",
      boxShadow: "0 3px 10px rgba(160,140,80,0.18)",
      border: "1px solid #efe5c8",
    };
    if (item.type === "pdf" && item.thumbnail) {
      return <NextImage src={item.thumbnail} alt={item.title} width={40} height={52} style={style} unoptimized />;
    }
    if (item.type === "img" && item.url) {
      return <NextImage src={item.url} alt={item.title} width={40} height={52} style={style} unoptimized />;
    }
    return item.type === "pdf" ? (
      <FaFilePdf className="text-[#b54434]" size={32} />
    ) : (
      <FaFileImage className="text-[#1d5f8a]" size={32} />
    );
  }

  return (
    <div
      className="min-h-screen py-12 px-3"
      style={{ background: "radial-gradient(1200px 600px at 50% -100px, #fff8e9 0%, #f5efdf 45%, #f2ecde 100%)" }}
    >
      {/* 見出し */}
      <div className="max-w-5xl mx-auto mb-6 px-2">
        <h1 className="text-[26px] sm:text-[28px] font-extrabold text-[#5c4a16] text-center tracking-wide">
          書庫・アーカイブ
        </h1>
        <div
          aria-hidden
          className="h-1 w-36 mx-auto rounded-full mt-3"
          style={{ background: "linear-gradient(90deg, #e7c76a, #caa64b 45%, #e7c76a)", boxShadow: "0 1px 0 #fff inset" }}
        />
      </div>

      {/* コントロール：検索＆並び替え */}
      <div className="max-w-5xl mx-auto mb-5 flex flex-wrap gap-10 items-center justify-between px-2">
        <div className="flex items-center gap-2 bg-white rounded-full px-3 py-2"
          style={{ border: "1px solid #efe5c8", boxShadow: "0 10px 24px rgba(160,140,80,0.10)" }}>
          <FaSearch />
          <input
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            placeholder="タイトルで検索"
            className="outline-none bg-transparent w-[58vw] max-w-[360px]"
          />
        </div>
        <div className="bg-white rounded-full px-3 py-2"
          style={{ border: "1px solid #efe5c8", boxShadow: "0 10px 24px rgba(160,140,80,0.10)" }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="bg-transparent outline-none"
          >
            <option value="new">新着順</option>
            <option value="old">古い順</option>
            <option value="title">タイトル A→Z</option>
          </select>
        </div>
      </div>

      {/* 年度アコーディオン */}
      <div className="max-w-5xl mx-auto space-y-6">
        {loading ? (
          <div className="text-center text-[#7b6a3a] opacity-80">読み込み中…</div>
        ) : (
          fyGroups.map((group) => {
            const isFYOpen = openFY === group.name;
            return (
              <div key={group.name} className="rounded-2xl bg-white"
                style={{ border: "1px solid #efe5c8", boxShadow: "0 12px 28px rgba(160,140,80,0.15), 0 1px 0 #fff inset" }}>
                <button
                  onClick={() => setOpenFY(isFYOpen ? null : group.name)}
                  className="w-full flex items-center justify-between px-5 py-3 text-left"
                  style={{ color: "#5c4a16", fontWeight: 800, fontSize: 18 }}
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: "#caa64b", boxShadow: "0 0 0 3px rgba(202,166,75,0.18)" }} />
                    {group.name}
                  </span>
                  <FaChevronDown className={`transition-transform ${isFYOpen ? "rotate-180" : ""}`} />
                </button>

                {isFYOpen && (
                  <div className="px-4 pb-4 space-y-4">
                    {group.cats.map((cat, idx) => {
                      const catKey = `${group.name}-${idx}`;
                      const isCatOpen = (openCat[group.name] ?? 0) === idx;
                      return (
                        <div key={catKey} className="rounded-2xl bg-[#fffdf6]"
                          style={{ border: "1px solid #efe5c8" }}>
                          <button
                            onClick={() =>
                              setOpenCat((prev) => ({ ...prev, [group.name]: isCatOpen ? null : idx }))
                            }
                            className="w-full flex items-center justify-between px-4 py-2 text-left"
                            style={{ color: "#6b5a1f", fontWeight: 800 }}
                          >
                            <span className="flex items-center gap-2">{cat.name}</span>
                            <FaChevronDown className={`transition-transform ${isCatOpen ? "rotate-180" : ""}`} />
                          </button>

                          {isCatOpen && (
                            <div className="px-3 pb-3">
                              {cat.items.length === 0 ? (
                                <div className="text-[#7b6a3a] text-sm py-2 px-2 opacity-80">まだ登録がありません</div>
                              ) : (
                                <ul className="space-y-2">
                                  {cat.items.map((item) => (
                                    <li key={item.id}
                                      className="flex items-center gap-3 px-2 py-2 rounded-xl transition"
                                      style={{ background: "#fff", border: "1px solid #efe5c8" }}>
                                      {/* サムネ */}
                                      <div className="min-w-[44px]">{getFileIcon(item)}</div>

                                      {/* タイトル＋日付 */}
                                      <div className="flex-1 min-w-0">
                                        <p className="truncate text-[15px]" style={{ color: "#3a3526", fontWeight: 600 }}>
                                          {item.title}
                                        </p>
                                        {item._date && (
                                          <p className="text-xs opacity-70" style={{ color: "#6b5a1f" }}>
                                            {formatDate(item._date)}（{item._fy}）
                                          </p>
                                        )}
                                      </div>

                                      {/* アクション */}
                                      <div className="flex items-center gap-2">
                                        {/* 見る */}
                                        {item.type === "pdf" ? (
                                          <button
                                            onClick={() => setPdfPreview({ url: `${item.url}#view=FitH`, title: item.title })}
                                            className="flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-full transition"
                                            style={{
                                              color: "#3a2e0f",
                                              border: "1px solid #caa64b",
                                              background:
                                                "linear-gradient(90deg, #f2dc96 0%, #d7b458 45%, #efd67a 100%)",
                                              boxShadow: "0 6px 14px rgba(160,140,80,0.18)",
                                              fontWeight: 800,
                                            }}
                                          >
                                            <FaRegEye /> 見る
                                          </button>
                                        ) : (
                                          <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-full transition"
                                            style={{
                                              color: "#3a2e0f",
                                              border: "1px solid #caa64b",
                                              background:
                                                "linear-gradient(90deg, #f2dc96 0%, #d7b458 45%, #efd67a 100%)",
                                              boxShadow: "0 6px 14px rgba(160,140,80,0.18)",
                                              fontWeight: 800,
                                            }}
                                          >
                                            <FaRegEye /> 見る
                                          </a>
                                        )}

                                        {/* DL */}
                                        <a
                                          href={item.url}
                                          download
                                          className="flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-full transition"
                                          style={{
                                            color: "#24522e",
                                            border: "1px solid #b3d3b8",
                                            background:
                                              "linear-gradient(90deg, #d3f1d6 0%, #bfe9c5 45%, #d0f0d4 100%)",
                                            boxShadow: "0 6px 14px rgba(80,140,80,0.14)",
                                            fontWeight: 800,
                                          }}
                                        >
                                          <FaDownload /> DL
                                        </a>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* PDFモーダル（簡易プレビュー） */}
      {pdfPreview && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setPdfPreview(null)}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[92vw] h-[84vh] bg-white rounded-2xl overflow-hidden"
            style={{ border: "1px solid #efe5c8", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
          >
            <div className="flex items-center justify-between px-4 py-2" style={{ background: "#fffdf6", borderBottom: "1px solid #efe5c8" }}>
              <strong style={{ color: "#5c4a16" }}>{pdfPreview.title}</strong>
              <div className="flex items-center gap-2">
                <a
                  href={pdfPreview.url.replace("#view=FitH", "")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline"
                  style={{ color: "#6b5a1f" }}
                >
                  新規タブで開く
                </a>
                <button onClick={() => setPdfPreview(null)} className="text-sm" style={{ color: "#6b5a1f" }}>
                  閉じる
                </button>
              </div>
            </div>
            <iframe
              title="pdf-preview"
              src={pdfPreview.url}
              className="w-full h-full"
              style={{ border: 0 }}
            />
          </div>
        </div>
      )}

      {/* モバイル微調整 */}
      <style>{`
        @media (max-width: 600px){
          h1 { font-size: 1.2rem !important; }
        }
      `}</style>
    </div>
  );
}

/* ---- 小さなユーティリティ ---- */
function toFiscalYear(d?: Date) {
  // 日本の年度（4/1〜翌3/31）
  const now = d ?? new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0=1月
  const fy = m >= 3 ? y : y - 1;
  return `${fy}年度`;
}
function currentFiscalYear() {
  return toFiscalYear(new Date());
}
function pad(n: number) {
  return n.toString().padStart(2, "0");
}
function formatDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// src/app/archive/page.tsx
"use client";
import { useCallback, useEffect, useMemo, useState, startTransition } from "react";
import {
  FaFilePdf,
  FaFileImage,
  FaDownload,
  FaRegEye,
  FaChevronDown,
  FaSearch,
} from "react-icons/fa";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  limit,
} from "firebase/firestore";
import NextImage from "next/image";

// 表示カテゴリ順
const CATEGORIES = ["管理組合", "理事会", "検討委員会", "暮らしと防災", "管理室"] as const;
type CatName = (typeof CATEGORIES)[number];

type ArchiveItem = {
  id: string;
  category: CatName | string;
  title: string;
  url: string;
  type: "pdf" | "img";
  thumbnail?: string;
  createdAt?: any; // Firestore Timestamp | string | Date
  _date?: Date;    // 取得時に補完
  _fy?: string;    // "2025年度" など
};

type SortKey = "new" | "old" | "title";

const FY_CACHE_PREFIX = "phoc_archive_fy_";

export default function ArchivePage() {
  const [openFY, setOpenFY] = useState<string | null>(null); // 年度アコーディオン
  const [openCat, setOpenCat] = useState<Record<string, number | null>>({}); // 年度ごとにカテゴリ開閉
  const [itemsByFY, setItemsByFY] = useState<Record<string, ArchiveItem[]>>({});
  const [fyOrder, setFyOrder] = useState<string[]>([]); // 表示順（最新→過去）
  const [loadingFY, setLoadingFY] = useState<Record<string, boolean>>({});
  const [initializing, setInitializing] = useState(true);

  // 検索・並び替え
  const [qText, setQText] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("new");

  // PDFプレビュー用モーダル
  const [pdfPreview, setPdfPreview] = useState<{ url: string; title: string } | null>(null);

  // ---- 初期は最新年度のみロード（爆速ファーストビュー）----
  useEffect(() => {
    (async () => {
      const fy = currentFiscalYear();
      setFyOrder([fy]);
      setOpenFY(fy);
      setOpenCat({ [fy]: 0 });

      // キャッシュ復元 or ネット取得
      const cached = readFYCache(fy);
      if (cached) {
        setItemsByFY((prev) => ({ ...prev, [fy]: cached }));
        setInitializing(false);
      } else {
        await loadFY(fy);
        setInitializing(false);
      }
    })();
  }, []);

  // ---- 指定年度を Firestore から遅延ロード ----
  const loadFY = useCallback(async (fy: string) => {
    if (loadingFY[fy]) return;
    setLoadingFY((prev) => ({ ...prev, [fy]: true }));
    try {
      const { start, end } = getFYRange(fy); // [FY-04-01, (FY+1)-04-01)
      // createdAt が Timestamp の想定
      const qRef = query(
        collection(db, "archives"),
        where("createdAt", ">=", start),
        where("createdAt", "<", end),
        orderBy("createdAt", "desc"),
        limit(800) // 年度内上限（必要に応じ調整）
      );
      const snap = await getDocs(qRef);
      const list: ArchiveItem[] = snap.docs.map((doc) => {
        const d = doc.data() as any;
        const date =
          (d.createdAt?.toDate?.() as Date | undefined) ??
          (typeof d.createdAt === "string" ? new Date(d.createdAt) : undefined) ??
          undefined;
        return {
          id: doc.id,
          category: d.category as string,
          title: d.title as string,
          url: d.url as string,
          type: d.type as "pdf" | "img",
          thumbnail: d.thumbnail as string | undefined,
          createdAt: d.createdAt,
          _date: date,
          _fy: fy,
        };
      });

      // キャッシュ保存
      writeFYCache(fy, list);

      startTransition(() => {
        setItemsByFY((prev) => ({ ...prev, [fy]: list }));
      });
    } catch (e) {
      // createdAt の型不一致などで範囲クエリが失敗した場合のフォールバック（全件→年度フィルタ）
      try {
        const qAll = query(collection(db, "archives"), orderBy("createdAt", "desc"));
        const snap = await getDocs(qAll);
        const list: ArchiveItem[] = snap.docs
          .map((doc) => {
            const d = doc.data() as any;
            const date =
              (d.createdAt?.toDate?.() as Date | undefined) ??
              (typeof d.createdAt === "string" ? new Date(d.createdAt) : undefined) ??
              undefined;
            return {
              id: doc.id,
              category: d.category as string,
              title: d.title as string,
              url: d.url as string,
              type: d.type as "pdf" | "img",
              thumbnail: d.thumbnail as string | undefined,
              createdAt: d.createdAt,
              _date: date,
              _fy: toFiscalYear(date),
            };
          })
          .filter((i) => i._fy === fy);
        writeFYCache(fy, list);
        setItemsByFY((prev) => ({ ...prev, [fy]: list }));
      } catch {
        // 何もしない（UI側で空扱い）
        setItemsByFY((prev) => ({ ...prev, [fy]: [] }));
      }
    } finally {
      setLoadingFY((prev) => ({ ...prev, [fy]: false }));
    }
  }, [loadingFY]);

  // 表示対象（開いている年度だけレンダリング密度を上げる）
  const currentItems = itemsByFY[openFY ?? ""] ?? [];

  // 検索・並び替え適用
  const filteredSorted = useMemo(() => {
    const qLower = qText.trim().toLowerCase();
    let arr = currentItems.filter((i) => !qLower || i.title.toLowerCase().includes(qLower));
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
  }, [currentItems, qText, sortBy]);

  // 年度 → カテゴリの2段グルーピング（開いてる年度のみ計算）
  const catsForOpenFY = useMemo(() => {
    const fy = openFY ?? currentFiscalYear();
    return CATEGORIES.map((cat) => ({
      name: cat as CatName,
      items: filteredSorted.filter((i) => (i.category as string) === cat),
    }));
  }, [filteredSorted, openFY]);

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
      return (
        <NextImage
          src={item.thumbnail}
          alt={item.title}
          width={40}
          height={52}
          style={style}
          unoptimized
        />
      );
    }
    if (item.type === "img" && item.url) {
      return (
        <NextImage
          src={item.url}
          alt={item.title}
          width={40}
          height={52}
          style={style}
          unoptimized
        />
      );
    }
    return item.type === "pdf" ? (
      <FaFilePdf className="text-[#b54434]" size={32} />
    ) : (
      <FaFileImage className="text-[#1d5f8a]" size={32} />
    );
  }

  // 過去年度を1つずつ追加で読み込む（UIボタン）
  const loadPrevFY = async () => {
    const base = openFY ?? currentFiscalYear();
    const prev = prevFiscalYear(base);
    setFyOrder((prevList) => (prevList.includes(prev) ? prevList : [...prevList, prev]));
    // まだ開いていないFY＝軽量。クリックされたらロード
  };

  return (
    <div
      className="min-h-screen py-12 px-3"
      style={{
        background:
          "radial-gradient(1200px 600px at 50% -100px, #fff8e9 0%, #f5efdf 45%, #f2ecde 100%)",
      }}
    >
      {/* 見出し */}
      <div className="max-w-5xl mx-auto mb-6 px-2">
        <h1 className="text-[26px] sm:text-[28px] font-extrabold text-[#5c4a16] text-center tracking-wide">
          書庫・アーカイブ
        </h1>
        <div
          aria-hidden
          className="h-1 w-36 mx-auto rounded-full mt-3"
          style={{
            background: "linear-gradient(90deg, #e7c76a, #caa64b 45%, #e7c76a)",
            boxShadow: "0 1px 0 #fff inset",
          }}
        />
      </div>

      {/* コントロール：検索＆並び替え */}
      <div className="max-w-5xl mx-auto mb-5 flex flex-wrap gap-10 items-center justify-between px-2">
        <div
          className="flex items-center gap-2 bg-white rounded-full px-3 py-2"
          style={{ border: "1px solid #efe5c8", boxShadow: "0 10px 24px rgba(160,140,80,0.10)" }}
        >
          <FaSearch />
          <input
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            placeholder="タイトルで検索"
            className="outline-none bg-transparent w-[58vw] max-w-[360px]"
          />
        </div>
        <div
          className="bg-white rounded-full px-3 py-2"
          style={{ border: "1px solid #efe5c8", boxShadow: "0 10px 24px rgba(160,140,80,0.10)" }}
        >
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

      {/* 年度アコーディオン（まずは最新年度だけ表示） */}
      <div className="max-w-5xl mx-auto space-y-6">
        {initializing ? (
          <div className="animate-pulse text-[#7b6a3a] opacity-80">
            <div className="h-24 rounded-2xl bg-[#fffdf6]" />
            <div className="h-24 rounded-2xl bg-[#fffdf6] mt-3" />
          </div>
        ) : (
          fyOrder.map((fy) => {
            const isFYOpen = openFY === fy;
            const hasData = (itemsByFY[fy]?.length ?? 0) > 0;

            return (
              <div
                key={fy}
                className="rounded-2xl bg-white"
                style={{
                  border: "1px solid #efe5c8",
                  boxShadow:
                    "0 12px 28px rgba(160,140,80,0.15), 0 1px 0 #fff inset",
                }}
              >
                <button
                  onClick={async () => {
                    setOpenFY((cur) => (cur === fy ? null : fy));
                    // 初めて開く年度なら読み込み
                    if (!itemsByFY[fy]) {
                      await loadFY(fy);
                      setOpenCat((prev) => ({ ...prev, [fy]: 0 }));
                    }
                  }}
                  className="w-full flex items-center justify-between px-5 py-3 text-left"
                  style={{ color: "#5c4a16", fontWeight: 800, fontSize: 18 }}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{
                        background: "#caa64b",
                        boxShadow: "0 0 0 3px rgba(202,166,75,0.18)",
                      }}
                    />
                    {fy}
                  </span>
                  <div className="flex items-center gap-3">
                    {loadingFY[fy] && (
                      <span className="text-xs opacity-70">読み込み中…</span>
                    )}
                    <FaChevronDown
                      className={`transition-transform ${
                        isFYOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {isFYOpen && (
                  <div className="px-4 pb-4 space-y-4">
                    {!hasData && !loadingFY[fy] ? (
                      <div className="text-[#7b6a3a] text-sm py-2 px-2 opacity-80">
                        この年度の資料はまだ登録がありません
                      </div>
                    ) : (
                      catsForOpenFY.map((cat, idx) => {
                        const isCatOpen = (openCat[fy] ?? 0) === idx;
                        return (
                          <div
                            key={`${fy}-${idx}`}
                            className="rounded-2xl bg-[#fffdf6]"
                            style={{ border: "1px solid #efe5c8" }}
                          >
                            <button
                              onClick={() =>
                                setOpenCat((prev) => ({
                                  ...prev,
                                  [fy]: isCatOpen ? null : idx,
                                }))
                              }
                              className="w-full flex items-center justify-between px-4 py-2 text-left"
                              style={{ color: "#6b5a1f", fontWeight: 800 }}
                            >
                              <span className="flex items-center gap-2">
                                {cat.name}
                                <span className="text-xs opacity-60">
                                  ({cat.items.length})
                                </span>
                              </span>
                              <FaChevronDown
                                className={`transition-transform ${
                                  isCatOpen ? "rotate-180" : ""
                                }`}
                              />
                            </button>

                            {isCatOpen && (
                              <div className="px-3 pb-3">
                                {cat.items.length === 0 ? (
                                  <div className="text-[#7b6a3a] text-sm py-2 px-2 opacity-80">
                                    まだ登録がありません
                                  </div>
                                ) : (
                                  <ul className="space-y-2">
                                    {cat.items.map((item) => (
                                      <li
                                        key={item.id}
                                        className="flex items-center gap-3 px-2 py-2 rounded-xl transition"
                                        style={{
                                          background: "#fff",
                                          border: "1px solid #efe5c8",
                                        }}
                                      >
                                        {/* サムネ */}
                                        <div className="min-w-[44px]">
                                          {getFileIcon(item)}
                                        </div>

                                        {/* タイトル＋日付 */}
                                        <div className="flex-1 min-w-0">
                                          <p
                                            className="truncate text-[15px]"
                                            style={{
                                              color: "#3a3526",
                                              fontWeight: 600,
                                            }}
                                          >
                                            {item.title}
                                          </p>
                                          {item._date && (
                                            <p
                                              className="text-xs opacity-70"
                                              style={{ color: "#6b5a1f" }}
                                            >
                                              {formatDate(item._date)}（{fy}）
                                            </p>
                                          )}
                                        </div>

                                        {/* アクション */}
                                        <div className="flex items-center gap-2">
                                          {/* 見る */}
                                          {item.type === "pdf" ? (
                                            <button
                                              onClick={() =>
                                                setPdfPreview({
                                                  url: `${item.url}#view=FitH`,
                                                  title: item.title,
                                                })
                                              }
                                              className="flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-full transition"
                                              style={{
                                                color: "#3a2e0f",
                                                border: "1px solid #caa64b",
                                                background:
                                                  "linear-gradient(90deg, #f2dc96 0%, #d7b458 45%, #efd67a 100%)",
                                                boxShadow:
                                                  "0 6px 14px rgba(160,140,80,0.18)",
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
                                                boxShadow:
                                                  "0 6px 14px rgba(160,140,80,0.18)",
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
                                              boxShadow:
                                                "0 6px 14px rgba(80,140,80,0.14)",
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
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* “過去の年度を読み込む”— 初期表示は最新年度だけにして爆速化 */}
        <div className="max-w-5xl mx-auto mt-4">
          <button
            onClick={loadPrevFY}
            className="mx-auto block rounded-full border border-[#d9c78a] px-5 py-2 text-sm font-semibold text-[#6b5a1f] bg-white hover:bg-[#fff7dd] transition"
          >
            過去の年度を読み込む
          </button>
        </div>
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
            style={{
              border: "1px solid #efe5c8",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{
                background: "#fffdf6",
                borderBottom: "1px solid #efe5c8",
              }}
            >
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
                <button
                  onClick={() => setPdfPreview(null)}
                  className="text-sm"
                  style={{ color: "#6b5a1f" }}
                >
                  閉じる
                </button>
              </div>
            </div>
            <iframe title="pdf-preview" src={pdfPreview.url} className="w-full h-full" style={{ border: 0 }} />
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

/* ---- ユーティリティ ---- */
function toFiscalYear(d?: Date) {
  const now = d ?? new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0=1月
  const fy = m >= 3 ? y : y - 1;
  return `${fy}年度`;
}
function currentFiscalYear() {
  return toFiscalYear(new Date());
}
function prevFiscalYear(fyLabel: string) {
  const y = parseInt(fyLabel.replace("年度", ""), 10);
  return `${y - 1}年度`;
}
function pad(n: number) {
  return n.toString().padStart(2, "0");
}
function formatDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function getFYRange(fyLabel: string) {
  const y = parseInt(fyLabel.replace("年度", ""), 10);
  const start = new Date(y, 3, 1, 0, 0, 0);       // y/04/01 00:00:00
  const end   = new Date(y + 1, 3, 1, 0, 0, 0);   // (y+1)/04/01 00:00:00
  return { start, end };
}
function readFYCache(fy: string): ArchiveItem[] | null {
  try {
    const raw = sessionStorage.getItem(FY_CACHE_PREFIX + fy);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ArchiveItem[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
function writeFYCache(fy: string, items: ArchiveItem[]) {
  try {
    sessionStorage.setItem(FY_CACHE_PREFIX + fy, JSON.stringify(items));
  } catch {}
}

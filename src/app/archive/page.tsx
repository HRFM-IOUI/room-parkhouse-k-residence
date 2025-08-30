// src/app/archive/page.tsx
"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  startTransition,
} from "react";
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
  _date?: Date | any; // キャッシュ復元後に string も来るので any→coerceDateで吸収
  _fy?: string;    // "2025年度" など
};

type SortKey = "new" | "old" | "title";

const FY_CACHE_PREFIX = "phoc_archive_fy_";

/* -------------------- 日付ユーティリティ -------------------- */
// なんでも受け取って Date | undefined を返す安全関数
function coerceDate(v: any): Date | undefined {
  if (!v) return undefined;
  if (v instanceof Date) return isNaN(v.getTime()) ? undefined : v;
  if (typeof v === "string") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? undefined : d;
  }
  if (typeof v === "number") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? undefined : d;
  }
  if (typeof v === "object") {
    if (typeof v.toDate === "function") {
      try {
        const d = v.toDate();
        return d instanceof Date && !isNaN(d.getTime()) ? d : undefined;
      } catch {}
    }
    if (typeof v.seconds === "number") {
      return new Date(v.seconds * 1000);
    }
    if (typeof v._seconds === "number") {
      return new Date(v._seconds * 1000);
    }
  }
  return undefined;
}
function timeValue(v: any): number {
  const d = coerceDate(v);
  return d ? d.getTime() : 0;
}
function pad(n: number) {
  return n.toString().padStart(2, "0");
}
function formatDateSafe(v: any) {
  const d = coerceDate(v);
  if (!d) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/* -------------------- 年度ユーティリティ -------------------- */
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
function getFYRange(fyLabel: string) {
  const y = parseInt(fyLabel.replace("年度", ""), 10);
  const start = new Date(y, 3, 1, 0, 0, 0);       // y/04/01 00:00:00
  const end   = new Date(y + 1, 3, 1, 0, 0, 0);   // (y+1)/04/01 00:00:00
  return { start, end };
}

/* -------------------- 検索ユーティリティ -------------------- */
function normalizeText(s: string) {
  if (!s) return "";
  const toHalf = s.replace(/[！-～]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)
  );
  return toHalf.toLocaleLowerCase("ja");
}
function splitTokens(q: string) {
  return normalizeText(q).trim().split(/\s+/).filter(Boolean);
}
function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function highlight(text: string, tokens: string[]) {
  if (!tokens.length) return text;
  const pattern = new RegExp(tokens.map(escapeRegExp).join("|"), "gi");
  const parts = text.split(pattern);
  const matches = text.match(pattern) || [];
  return (
    <>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {p}
          {matches[i] && (
            <mark
              className="px-0.5 rounded-sm"
              style={{ background: "#fff2a8" }}
            >
              {matches[i]}
            </mark>
          )}
        </React.Fragment>
      ))}
    </>
  );
}

/* -------------------- キャッシュ -------------------- */
function readFYCache(fy: string): ArchiveItem[] | null {
  try {
    const raw = sessionStorage.getItem(FY_CACHE_PREFIX + fy);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ArchiveItem[];
    if (!Array.isArray(parsed)) return null;
    // 重要：_date/createdAt を Date に再水和
    return parsed.map((it) => {
      const hydrated: ArchiveItem = { ...it };
      hydrated._date = coerceDate(it._date) ?? coerceDate(it.createdAt);
      return hydrated;
    });
  } catch {
    return null;
  }
}
function writeFYCache(fy: string, items: ArchiveItem[]) {
  try {
    // DateはISO文字列として保存されるので、read時に再水和する
    sessionStorage.setItem(FY_CACHE_PREFIX + fy, JSON.stringify(items));
  } catch {}
}

/* -------------------- 本体 -------------------- */
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
  const searchTokens = useMemo(() => splitTokens(qText), [qText]);

  // 検索時に自動開閉するが、ユーザーが手動で触ったら以降は尊重する
  const [userTouched, setUserTouched] = useState(false);

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
      const qRef = query(
        collection(db, "archives"),
        where("createdAt", ">=", start),
        where("createdAt", "<", end),
        orderBy("createdAt", "desc"),
        limit(800)
      );
      const snap = await getDocs(qRef);
      const list: ArchiveItem[] = snap.docs.map((doc) => {
        const d = doc.data() as any;
        const date =
          coerceDate(d.createdAt?.toDate?.()) ??
          coerceDate(d.createdAt) ??
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
    } catch {
      // フォールバック（全件→年度フィルタ）
      try {
        const qAll = query(collection(db, "archives"), orderBy("createdAt", "desc"));
        const snap = await getDocs(qAll);
        const list: ArchiveItem[] = snap.docs
          .map((doc) => {
            const d = doc.data() as any;
            const date =
              coerceDate(d.createdAt?.toDate?.()) ??
              coerceDate(d.createdAt) ??
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
        setItemsByFY((prev) => ({ ...prev, [fy]: [] }));
      }
    } finally {
      setLoadingFY((prev) => ({ ...prev, [fy]: false }));
    }
  }, [loadingFY]);

  // ロード済み全アイテム（検索はロード済み範囲で実行）
  const allLoadedItems = useMemo(
    () => fyOrder.flatMap((fy) => itemsByFY[fy] ?? []),
    [fyOrder, itemsByFY]
  );

  // 検索ヒット判定
  const matchesSearch = useCallback(
    (item: ArchiveItem) => {
      if (searchTokens.length === 0) return true;
      const titleN = normalizeText(item.title || "");
      return searchTokens.every((t) => titleN.includes(t));
    },
    [searchTokens]
  );

  // FY別ヒット件数（バッジ用）
  const hitsByFY = useMemo(() => {
    if (searchTokens.length === 0) return {} as Record<string, number>;
    const m: Record<string, number> = {};
    for (const it of allLoadedItems) {
      if (matchesSearch(it)) {
        const fy = it._fy ?? currentFiscalYear();
        m[fy] = (m[fy] ?? 0) + 1;
      }
    }
    return m;
  }, [allLoadedItems, matchesSearch, searchTokens.length]);

  // 検索時：もっともヒットの多いFYを選出
  const bestFYForSearch = useMemo(() => {
    if (searchTokens.length === 0) return null;
    const e = Object.entries(hitsByFY).sort((a, b) => b[1] - a[1])[0];
    return e?.[0] ?? null;
  }, [hitsByFY, searchTokens.length]);

  // 検索時：対象FY内で最初のヒットIDを抽出（スクロール用）
  const firstHitIdForFY = useMemo(() => {
    if (!bestFYForSearch) return null;
    const arr = (itemsByFY[bestFYForSearch] ?? []).filter(matchesSearch);
    arr.sort((a, b) => {
      if (sortBy === "new") return timeValue(b._date) - timeValue(a._date);
      if (sortBy === "old") return timeValue(a._date) - timeValue(b._date);
      return a.title.localeCompare(b.title, "ja");
    });
    return arr[0]?.id ?? null;
  }, [bestFYForSearch, itemsByFY, matchesSearch, sortBy]);

  // 検索トグル時は自動制御をリセット
  useEffect(() => {
    if (searchTokens.length === 0) setUserTouched(false);
  }, [searchTokens.length]);

  // 検索時の自動オープン & スクロール（ユーザー操作があれば上書きしない）
  useEffect(() => {
    if (searchTokens.length === 0 || userTouched) return;

    const openToFY = async (fy: string) => {
      if (!itemsByFY[fy]) {
        await loadFY(fy);
      }
      setOpenFY(fy);

      // ヒット最多カテゴリを開く
      const counts = CATEGORIES.map((c, idx) => [
        idx,
        (itemsByFY[fy] ?? []).filter(
          (i) => (i.category as string) === c && matchesSearch(i)
        ).length,
      ]);
      const bestIdx = counts.sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] ?? 0;
      setOpenCat((prev) => ({ ...prev, [fy]: bestIdx }));

      // 最初のヒットまでスムーズスクロール
      setTimeout(() => {
        if (firstHitIdForFY) {
          document
            .getElementById(`hit-${firstHitIdForFY}`)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 0);
    };

    if (bestFYForSearch) openToFY(bestFYForSearch);
  }, [
    searchTokens.length,
    userTouched,
    bestFYForSearch,
    itemsByFY,
    loadFY,
    matchesSearch,
    firstHitIdForFY,
  ]);

  // 表示対象FY（開いている年度）
  const currentItems = itemsByFY[openFY ?? ""] ?? [];

  // 開いているFYのカテゴリ×アイテム（検索を反映）
  const catsForOpenFY = useMemo(() => {
    const base = currentItems.filter(matchesSearch);
    return CATEGORIES.map((cat) => ({
      name: cat as CatName,
      items: base.filter((i) => (i.category as string) === cat),
    }));
  }, [currentItems, matchesSearch]);

  // 並べ替え（開いているFYの表示に適用）
  const sortedCatsForOpenFY = useMemo(() => {
    return catsForOpenFY.map((c) => ({
      ...c,
      items: [...c.items].sort((a, b) => {
        if (sortBy === "new") return timeValue(b._date) - timeValue(a._date);
        if (sortBy === "old") return timeValue(a._date) - timeValue(b._date);
        return a.title.localeCompare(b.title, "ja");
      }),
    }));
  }, [catsForOpenFY, sortBy]);

  // 過去年度を1つずつ「表示対象」に追加（必要になったらクリックでロード）
  const loadPrevFY = async () => {
    const base = fyOrder[fyOrder.length - 1] ?? currentFiscalYear();
    const prev = prevFiscalYear(base);
    if (!fyOrder.includes(prev)) {
      setFyOrder((list) => [...list, prev]);
    }
    // 開くのはユーザー操作に任せる（押したタイミングでロード）
  };

  // FY見出し：ヒット件数バッジ
  const FYBadge: React.FC<{ fy: string }> = ({ fy }) =>
    searchTokens.length > 0 ? (
      <span
        className="ml-2 text-xs rounded-full px-2 py-0.5"
        style={{
          background: "#fff7dd",
          border: "1px solid #e7c76a",
          color: "#6b5a1f",
          fontWeight: 800,
        }}
      >
        {hitsByFY[fy] ?? 0}
      </span>
    ) : null;

  // CTA: トップへ戻る
  const TopCTA = () => (
    <a
      href="/"
      className="inline-block rounded-full px-5 py-2 text-sm font-semibold transition"
      style={{
        color: "#3a2e0f",
        border: "1px solid #caa64b",
        background:
          "linear-gradient(90deg, #f2dc96 0%, #d7b458 45%, #efd67a 100%)",
        boxShadow: "0 6px 14px rgba(160,140,80,0.18)",
      }}
    >
      トップへ戻る
    </a>
  );

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
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1" />
          <div className="text-center flex-1">
            <h1 className="text-[26px] sm:text-[28px] font-extrabold text-[#5c4a16] tracking-wide">
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
          <div className="flex-1 flex justify-end">
            <TopCTA />
          </div>
        </div>
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
            placeholder="タイトルで検索（例：議事録）"
            className="outline-none bg-transparent w-[58vw] max-w-[360px]"
            aria-label="タイトルで検索"
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
            aria-label="並び替え"
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
                    setUserTouched(true);
                    setOpenFY((cur) => (cur === fy ? null : fy));
                    // 初めて開く年度なら読み込み
                    if (!itemsByFY[fy]) {
                      await loadFY(fy);
                      setOpenCat((prev) => ({ ...prev, [fy]: 0 }));
                    }
                  }}
                  className="w-full flex items-center justify-between px-5 py-3 text-left"
                  style={{ color: "#5c4a16", fontWeight: 800, fontSize: 18 }}
                  aria-expanded={isFYOpen}
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
                    <FYBadge fy={fy} />
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
                      sortedCatsForOpenFY.map((cat, catIdx) => {
                        const isCatOpen = (openCat[fy] ?? 0) === catIdx;
                        const catHitCount =
                          searchTokens.length === 0
                            ? null
                            : cat.items.filter(matchesSearch).length;

                        return (
                          <div
                            key={`${fy}-${catIdx}`}
                            className="rounded-2xl bg-[#fffdf6]"
                            style={{ border: "1px solid #efe5c8" }}
                          >
                            <button
                              onClick={() => {
                                setUserTouched(true);
                                setOpenCat((prev) => ({
                                  ...prev,
                                  [fy]: isCatOpen ? null : catIdx,
                                }));
                              }}
                              className="w-full flex items-center justify-between px-4 py-2 text-left"
                              style={{
                                color: "#6b5a1f",
                                fontWeight: 800,
                                opacity:
                                  searchTokens.length > 0 && (catHitCount ?? 0) === 0
                                    ? 0.55
                                    : 1,
                              }}
                              aria-expanded={isCatOpen}
                            >
                              <span className="flex items-center gap-2">
                                {cat.name}
                                <span className="text-xs opacity-60">
                                  ({cat.items.length})
                                </span>
                                {searchTokens.length > 0 && (
                                  <span
                                    className="text-[11px] ml-2 rounded-full px-2 py-[1px]"
                                    style={{
                                      background: "#fff7dd",
                                      border: "1px solid #e7c76a",
                                    }}
                                  >
                                    ヒット {catHitCount}
                                  </span>
                                )}
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
                                        id={`hit-${item.id}`}
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
                                            {highlight(item.title, searchTokens)}
                                          </p>
                                          {item._date && (
                                            <p
                                              className="text-xs opacity-70"
                                              style={{ color: "#6b5a1f" }}
                                            >
                                              {formatDateSafe(item._date)}（{item._fy ?? ""}）
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

/* ---- サムネ or アイコン ---- */
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

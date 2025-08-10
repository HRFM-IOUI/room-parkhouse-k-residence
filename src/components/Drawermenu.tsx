// components/Drawermenu.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  collection,
  query as fsQuery,
  where,
  orderBy,
  limit as fsLimit,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase";

type Props = { open: boolean; onClose: () => void };
type MenuItem = { label: string; path: string; desc?: string };

type FireTs = { seconds?: number };
type Post = {
  id: string;
  title: string;
  createdAt: string | number | FireTs;
  richtext: string;
  image?: string;
  tags?: string[];
  category?: string[];
  slug?: string;
  status?: string;
};

const PRIMARY_ITEMS: MenuItem[] = [
  { label: "ログイン", path: "/login", desc: "会員向けページ" },
  { label: "NEWS一覧", path: "/posts", desc: "最新のお知らせ" },
  { label: "居住者ページ", path: "/residents", desc: "パスコード/各種手続き" },
  { label: "資料 / アーカイブ", path: "/archive", desc: "議事録・配布資料" },
];

const SECONDARY_ITEMS: MenuItem[] = [
  { label: "プライバシーポリシー", path: "/privacy" },
];

const SOCIALS = [
  { label: "X", href: "https://x.com/parkhouse_kamir", icon: "/svg/logo-black.png" },
  { label: "LINE", href: "https://line.me/R/ti/p/@667zhzws", icon: "/svg/line-icon.png" },
];

const FALLBACK_IMG = "/phoc.png";

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const toMs = (v: any) =>
  typeof v === "object" && v?.seconds ? v.seconds * 1000 : Number(new Date(v));
const formatDate = (v: Post["createdAt"]) => {
  const d = typeof v === "object" && (v as any)?.seconds
    ? new Date((v as any).seconds * 1000)
    : new Date(v as any);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};
const getThumb = (post: Post) => {
  if (typeof post.image === "string" && post.image) return post.image;
  const m = (post.richtext || "").match(/<img[^>]+src=['"]([^'"]+)['"]/i);
  return m?.[1] || FALLBACK_IMG;
};
const includesI = (text: string, q: string) => text.toLowerCase().includes(q.toLowerCase());

// 固定ページの簡易インデックス
const STATIC_PAGES: { title: string; path: string; keywords?: string[] }[] = [
  { title: "トップ", path: "/" },
  { title: "NEWS一覧", path: "/posts", keywords: ["お知らせ", "ニュース"] },
  { title: "居住者ページ", path: "/residents", keywords: ["居住者", "手続き", "ログイン"] },
  { title: "資料 / アーカイブ", path: "/archive", keywords: ["議事録", "配布資料", "管理組合"] },
  { title: "プライバシーポリシー", path: "/privacy" },
  { title: "お問い合わせ", path: "/contact" },
];

export default function Drawermenu({ open, onClose }: Props) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const [text, setText] = useState("");
  const [debounced, setDebounced] = useState("");

  // ドロワー開閉時のスクロール制御＆フォーカス
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => searchRef.current?.focus(), 10);
    } else {
      document.body.style.overflow = "";
      setText("");
      setDebounced("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escで閉じる
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // 外側クリックで閉じる
  const onBackdropDown = (e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
  };

  const go = (path: string) => {
    router.push(path);
    onClose();
  };

  // Firestore 取得（開いた時に一度だけ）
  useEffect(() => {
    if (!open || posts.length > 0 || loadingPosts) return;
    (async () => {
      try {
        setLoadingPosts(true);
        const snap = await getDocs(
          fsQuery(
            collection(db, "posts"),
            where("status", "==", "published"),
            orderBy("createdAt", "desc"),
            fsLimit(120) // 必要に応じて調整
          )
        );
        const mapped: Post[] = snap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          const richtext =
            typeof data.richtext === "string"
              ? data.richtext
              : typeof data.content === "string"
              ? data.content
              : "";
          return {
            id: doc.id,
            title: typeof data.title === "string" ? data.title : "",
            createdAt: data.createdAt ?? "",
            richtext,
            image: typeof data.image === "string" ? data.image : undefined,
            tags: Array.isArray(data.tags) ? data.tags : [],
            category: Array.isArray(data.category) ? data.category : [data.category].filter(Boolean),
            slug: typeof data.slug === "string" ? data.slug : "",
            status: data.status,
          };
        });
        setPosts(mapped);
      } finally {
        setLoadingPosts(false);
      }
    })();
  }, [open, posts.length, loadingPosts]);

  // 入力のデバウンス
  useEffect(() => {
    const t = setTimeout(() => setDebounced(text.trim()), 220);
    return () => clearTimeout(t);
  }, [text]);

  // 検索結果（記事／ページ／カテゴリ）
  const { postHits, pageHits, catHits } = useMemo(() => {
    const q = debounced;
    if (!q) return { postHits: [] as Post[], pageHits: [] as typeof STATIC_PAGES, catHits: [] as { name: string; count: number }[] };

    const p = posts
      .filter((post) => {
        const hay = [
          post.title || "",
          stripHtml(post.richtext || ""),
          ...(post.tags || []),
          ...(post.category || []),
          post.slug || "",
        ].join(" ");
        return includesI(hay, q);
      })
      .slice(0, 5);

    const pages = STATIC_PAGES.filter((pg) => includesI([pg.title, ...(pg.keywords || [])].join(" "), q)).slice(0, 5);

    // カテゴリ頻出
    const catCount = new Map<string, number>();
    for (const post of posts) {
      for (const c of post.category || []) {
        if (includesI(c, q)) catCount.set(c, (catCount.get(c) || 0) + 1);
      }
    }
    const cats = Array.from(catCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return { postHits: p, pageHits: pages, catHits: cats };
  }, [debounced, posts]);

  // Enter/ボタンで /posts?q=... に飛ぶ（一覧で詳しく見たいとき）
  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = text.trim();
    if (!q) return;
    router.push(`/posts?q=${encodeURIComponent(q)}`);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      className={`fixed inset-0 z-[100] transition-opacity duration-300 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{ background: "linear-gradient(120deg,#faf8ef 0%,#f5ecd8 85%,#ece1c4 100%)", backdropFilter: "blur(12px)" }}
      onMouseDown={onBackdropDown}
    >
      <div
        ref={panelRef}
        className={`relative mx-auto mt-6 sm:mt-10 w-[min(100%,940px)]
                    rounded-3xl bg-white/86 border border-[#e7ddc5]
                    shadow-[0_12px_50px_rgba(180,150,70,.18)]
                    transition-transform duration-300 ${open ? "translate-y-0" : "-translate-y-2"}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 sm:px-8 pt-6">
          <h2 id="drawer-title" className="text-[18px] font-bold text-[#7f6b39] tracking-wide">
            メニュー
          </h2>
          <div className="flex items-center gap-3 sm:gap-4">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-9 h-9 rounded-full bg-white/90 border border-[#dfc68e] shadow-sm flex items-center justify-center hover:scale-105 transition"
              >
                <img src={s.icon} alt={s.label} className="w-5 h-5" />
              </a>
            ))}
            <button
              onClick={onClose}
              className="rounded-full bg-white/95 border border-[#dfc68e] px-4 py-2 text-[#7f6b39] font-bold shadow-sm hover:bg-[#fff7d7] transition"
              aria-label="メニューを閉じる"
            >
              閉じる
            </button>
          </div>
        </div>

        {/* 検索（ライブ候補付き） */}
        <div className="px-6 sm:px-8 pt-4">
          <form onSubmit={submitSearch} className="relative">
            <input
              ref={searchRef}
              type="text"
              placeholder="サイト内検索"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full rounded-full border border-[#e3d7b8] bg-white/95 px-5 py-3 pr-11 outline-none text-[15px] text-[#333]"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-[#fff7e2] transition"
              aria-label="検索"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="7.5" stroke="#be9b52" strokeWidth="2" />
                <path d="M15 15l-3-3" stroke="#be9b52" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {/* 候補パネル */}
            {debounced && (
              <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-[#e7ddc5] bg-white shadow-xl overflow-hidden z-[120]">
                {/* 記事 */}
                <div className="p-3 border-b border-[#efe6cf]">
                  <div className="text-xs font-bold text-[#7f6b39] mb-2">記事</div>
                  {loadingPosts ? (
                    <div className="text-[13px] text-[#7b7361] px-1 py-2">読み込み中…</div>
                  ) : postHits.length === 0 ? (
                    <div className="text-[13px] text-[#7b7361] px-1 py-2">該当なし</div>
                  ) : (
                    <ul className="space-y-2 max-h-64 overflow-auto pr-1">
                      {postHits.map((p) => (
                        <li key={p.id}>
                          <Link
                            href={`/posts/${p.slug || p.id}`}
                            className="grid grid-cols-[54px_1fr] gap-2 items-center rounded-xl hover:bg-[#fff8e6]/60 px-2 py-2"
                            onClick={onClose}
                          >
                            <div className="relative w-[54px] h-[36px] rounded-md overflow-hidden bg-[#f3f6fa]">
                              <Image src={getThumb(p)} alt={p.title} fill className="object-cover" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[13.5px] font-bold text-[#18294d] truncate">{p.title}</div>
                              <div className="text-[11px] text-[#7a8699]">{formatDate(p.createdAt)}</div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* ページ */}
                <div className="p-3 border-b border-[#efe6cf]">
                  <div className="text-xs font-bold text-[#7f6b39] mb-2">ページ</div>
                  {pageHits.length === 0 ? (
                    <div className="text-[13px] text-[#7b7361] px-1 py-2">該当なし</div>
                  ) : (
                    <ul className="flex flex-col gap-1">
                      {pageHits.map((pg) => (
                        <li key={pg.path}>
                          <Link
                            href={pg.path}
                            className="block rounded-xl hover:bg-[#fff8e6]/60 px-2 py-2 text-[13.5px] text-[#18294d]"
                            onClick={onClose}
                          >
                            {pg.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* カテゴリ */}
                <div className="p-3">
                  <div className="text-xs font-bold text-[#7f6b39] mb-2">カテゴリ</div>
                  {catHits.length === 0 ? (
                    <div className="text-[13px] text-[#7b7361] px-1 py-2">該当なし</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {catHits.map((c) => (
                        <Link
                          key={c.name}
                          href={`/posts?cat=${encodeURIComponent(c.name)}`}
                          className="px-3 py-1 rounded-full border border-[#e1e7f1] text-[#39507d] bg-[#f7f9fc] text-[12px] font-bold"
                          onClick={onClose}
                          title={`${c.count}件`}
                        >
                          {c.name}（{c.count}）
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* すべて見る */}
                <button
                  type="button"
                  onClick={() => submitSearch()}
                  className="w-full text-center text-[13.5px] font-bold text-[#7f6b39] py-2.5 hover:bg-[#fff8e6]"
                >
                  “{debounced}” の結果をすべて見る →
                </button>
              </div>
            )}
          </form>
        </div>

        {/* 主要メニュー */}
        <div className="px-6 sm:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {PRIMARY_ITEMS.map((item) => (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className="group w-full rounded-2xl border border-[#e8dab3]
                           bg-gradient-to-br from-[#fffaf0] to-[#f7ecd7]
                           px-4 py-5 text-left hover:shadow-md hover:-translate-y-[1px] transition"
              >
                <div className="text-[#7f6b39] font-bold text-[15px]">{item.label}</div>
                {item.desc && <div className="text-[#8d815f] text-xs mt-1 opacity-90">{item.desc}</div>}
              </button>
            ))}
          </div>
        </div>

        {/* サブリンク（最小限） */}
        <div className="px-6 sm:px-8 pb-6">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-[#7b7361]">
            {SECONDARY_ITEMS.map((s) => (
              <Link
                key={s.path}
                href={s.path}
                className="hover:underline hover:text-[#bfa15a] transition"
                onClick={onClose}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

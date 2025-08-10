// components/Drawermenu.tsx
"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = { open: boolean; onClose: () => void; };
type MenuItem = { label: string; path: string; desc?: string; };

const PRIMARY_ITEMS: MenuItem[] = [
  { label: "ログイン", path: "/login", desc: "会員向けページ" },
  { label: "NEWS一覧", path: "/posts", desc: "最新のお知らせ" },
  { label: "居住者ページ", path: "/residents", desc: "パスコード/各種手続き" }, // ←変更
  { label: "資料 / アーカイブ", path: "/archive", desc: "議事録・配布資料" },     // ←変更
];

const SECONDARY_ITEMS: MenuItem[] = [
  { label: "プライバシーポリシー", path: "/privacy" },
];

const SOCIALS = [
  { label: "X", href: "https://x.com/parkhouse_kamir", icon: "/svg/logo-black.png" },
  { label: "LINE", href: "https://line.me/R/ti/p/@667zhzws", icon: "/svg/line-icon.png" },
];

export default function Drawermenu({ open, onClose }: Props) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => searchRef.current?.focus(), 10);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const go = (path: string) => { router.push(path); onClose(); };

  return (
    <div
      role="dialog" aria-modal="true" aria-labelledby="drawer-title"
      className={`fixed inset-0 z-[100] transition-opacity duration-300
                  ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      style={{ background: "linear-gradient(120deg,#faf8ef 0%,#f5ecd8 85%,#ece1c4 100%)", backdropFilter: "blur(12px)" }}
      onMouseDown={(e) => { if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose(); }}
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
          <h2 id="drawer-title" className="text-[18px] font-bold text-[#7f6b39] tracking-wide">メニュー</h2>
          <div className="flex items-center gap-3 sm:gap-4">
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                 aria-label={s.label}
                 className="w-9 h-9 rounded-full bg-white/90 border border-[#dfc68e] shadow-sm flex items-center justify-center hover:scale-105 transition">
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

        {/* 検索 */}
        <div className="px-6 sm:px-8 pt-4">
          <div className="relative">
            <input
              ref={searchRef}
              type="text" placeholder="サイト内検索"
              className="w-full rounded-full border border-[#e3d7b8] bg-white/95 px-5 py-3 pr-11 outline-none text-[15px] text-[#333]"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-[#fff7e2] transition" aria-label="検索">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="7.5" stroke="#be9b52" strokeWidth="2" />
                <path d="M15 15l-3-3" stroke="#be9b52" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* 主要メニュー */}
        <div className="px-6 sm:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {PRIMARY_ITEMS.map(item => (
              <button
                key={item.path} onClick={() => go(item.path)}
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
            {SECONDARY_ITEMS.map(s => (
              <Link key={s.path} href={s.path} className="hover:underline hover:text-[#bfa15a] transition" onClick={onClose}>
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

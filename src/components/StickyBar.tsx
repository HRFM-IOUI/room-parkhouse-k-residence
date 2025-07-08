"use client";
import React, { useState, useRef, useEffect } from "react";
import Drawermenu from "./Drawermenu";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StickyBar() {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [showBar, setShowBar] = useState<boolean>(true);
  const lastScroll = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (current > lastScroll.current && current > 32) setShowBar(false);
      else if (current < lastScroll.current) setShowBar(true);
      clearTimeout(timeoutRef.current!);
      timeoutRef.current = setTimeout(() => setShowBar(true), 210);
      lastScroll.current = current;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // メニュー名とパスを対応させる
  const navItems = [
    { label: "物件情報", path: "/property" },
    { label: "ライフスタイル", path: "/lifestyle" },
    { label: "施設サービス", path: "/facility" },
    { label: "アクセス", path: "/access" },
  ];

  return (
    <>
      <div
        className={`
          w-full sticky top-0 z-50
          transition-transform duration-500 pointer-events-auto
          ${showBar ? "translate-y-0" : "-translate-y-28"}
        `}
        style={{ willChange: "transform" }}
      >
        <div
          className={`
            mx-auto
            bg-white/90 backdrop-blur-xl shadow-[0_4px_38px_0_rgba(212,175,55,0.14)]
            mt-3
            w-full max-w-[1600px] h-[52px]
            rounded-[20px] border border-[#ececec]
            px-2 md:px-12 xl:px-16
            flex items-center justify-between
            transition-all duration-500
            group
          `}
          style={{
            fontFamily:
              '"Noto Sans JP", "Yu Gothic", Arial, Helvetica, sans-serif',
            boxShadow:
              "0 8px 36px 0 rgba(212,175,55,0.12), 0 0.5px 3.5px 0 #d4af3722",
            backdropFilter: "blur(14px)",
          }}
        >
          {/* ロゴ */}
          <div className="flex items-center min-w-0 ml-1 md:mr-8">
            <div className="flex items-center gap-1 md:gap-3 min-w-0">
              <span className="inline-block w-8 h-3 md:w-14 md:h-4 rounded-lg bg-gradient-to-r from-[#fffbe6] via-[#d4af37] to-[#bfa14a] shadow-lg animate-gradient-move" />
              <span
                className="text-[13px] md:text-[18px] font-serif font-bold select-none tracking-wide truncate"
                style={{
                  background:
                    "linear-gradient(90deg,#d4af37 25%,#fffbe6 60%,#bfa14a 95%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  maxWidth: "88vw",
                  display: "inline-block",
                }}
              >
                The Parkhouse Kamishakujii Residence
              </span>
            </div>
          </div>

          {/* ナビゲーション（PC） */}
          <nav className="hidden md:flex flex-1 gap-9 text-gray-800 font-medium text-[15.5px] items-center min-w-0">
            {navItems.map(({ label, path }, i) => (
              <Link
                href={path}
                key={i}
                className="px-1.5 py-1 relative group transition font-medium tracking-tight whitespace-nowrap cursor-pointer"
                style={{ fontWeight: 500 }}
              >
                <span className="relative z-10">{label}</span>
                <span className="block absolute left-0 right-0 -bottom-1 h-[2.5px] bg-gradient-to-r from-[#fffbe6] via-[#d4af37] to-[#bfa14a] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"></span>
              </Link>
            ))}
          </nav>

          {/* CTA（PCのみ） */}
          <div className="hidden md:flex items-center gap-4 ml-12">
            <button
              className="
                px-6 py-2 rounded-full bg-gradient-to-r from-[#fffbe6] via-[#d4af37] to-[#bfa14a]
                text-gray-900 font-semibold text-[14.5px] shadow
                hover:brightness-110 hover:scale-105 transition-all
                border border-[#ecd98b]
                min-w-0
              "
              style={{
                letterSpacing: "0.03em",
                boxShadow: "0 1px 8px #d4af3750",
              }}
              onClick={() => router.push("/login")}
            >
              ログイン
            </button>
            <button
              className="
                border border-[#d4af37] rounded-full px-5 py-2
                text-[#d4af37] font-semibold bg-white/95 hover:bg-[#fffbe6]/70 transition-all text-[14px]
                min-w-0
              "
              onClick={() => router.push("/contact")}
            >
              お問い合わせ
            </button>
          </div>

          {/* MENUボタン（常時表示・モバイル右端） */}
          <button
            className="
              flex items-center gap-1 px-2 py-1 md:px-5 md:py-2 rounded-full border border-gray-300
              bg-white/90 hover:bg-[#faf3d1]/80 transition text-gray-700 font-semibold
              text-[11px] md:text-[14px] shadow-sm ml-auto md:ml-2 min-w-0
            "
            onClick={() => setDrawerOpen(true)}
          >
            <span className="text-xs">MENU</span>
            <svg
              className="h-4 w-4 md:h-5 md:w-5 text-[#d4af37]"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </button>
        </div>
      </div>

      {/* Drawer menu */}
      <Drawermenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

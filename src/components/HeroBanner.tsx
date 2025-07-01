"use client";
import React, { useEffect, useState, useRef } from "react";
import { ParallaxProvider, Parallax } from "react-scroll-parallax";
import { motion } from "framer-motion";

const slides = [
  { img1: "/0001pfoc herobanner.jpg" },
  { img1: "/IMG_5614.jpg" },
  { img1: "/IMG_5615.jpg" },
];

type NewsItem = {
  date: string;
  title: string;
};

const news: NewsItem[] = [
  { date: "2025.06.30", title: "新サービス開始のお知らせ" },
  { date: "2025.06.25", title: "サイトリニューアルしました" },
  { date: "2025.06.20", title: "特別イベント開催情報" },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => setFade(false), 4500);
    const next = setTimeout(() => {
      setFade(true);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5200);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      clearTimeout(next);
    };
  }, [current]);

  const slide = slides[current];

  return (
    <ParallaxProvider>
      <section
        className="w-full flex justify-center items-center min-h-[320px] sm:min-h-[500px] py-6 sm:py-14 px-0 relative"
        style={{
          background: "linear-gradient(120deg, #f9fafb 0%, #f5f7fa 70%, #ecf4ef 100%)",
        }}
      >
        {/* 背景パララックス */}
        <Parallax speed={-30} className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none">
          <svg width="100%" height="100%" viewBox="0 0 1500 540" fill="none" className="w-full h-full">
            <defs>
              <linearGradient id="heroGrad" x1="0" y1="0" x2="1600" y2="600" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fffbe6" />
                <stop offset="0.5" stopColor="#d4af37" stopOpacity="0.13" />
                <stop offset="1" stopColor="#ecf4ef" stopOpacity="0.21" />
              </linearGradient>
            </defs>
            <rect x="0" y="40" width="1500" height="420" rx="32" fill="url(#heroGrad)" />
            <polygon points="0,540 170,40 400,540" fill="#fffbe6" opacity="0.09" />
            <polygon points="730,490 820,90 1280,530" fill="#fff" opacity="0.06" />
            <ellipse cx="1040" cy="240" rx="70" ry="26" fill="#f6e27a" opacity="0.11" />
            <rect x="1250" y="90" width="160" height="8" rx="4" fill="#fffbe6" opacity="0.14" />
          </svg>
        </Parallax>

        <div className="w-full max-w-[95vw] sm:max-w-[1320px] mx-auto px-2 relative z-20">
          {/* Hero画像＋NEWS（PC） */}
          <div className="relative w-full aspect-[16/8] sm:aspect-[16/7] rounded-[1.5rem] shadow-xl overflow-hidden border border-[#ecd98b]/40 bg-white/60 backdrop-blur-lg">
            {/* Hero画像 */}
            <motion.div
              className="absolute inset-0 w-full h-full bg-cover bg-center rounded-[1.5rem]"
              style={{
                backgroundImage: `url(${slide.img1})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: fade ? 1 : 0 }}
              transition={{ duration: 1 }}
            />
            {/* PCのみNEWS欄：画像右端に高さぴったり */}
            <div className="hidden sm:flex">
              <div
                className="
                  absolute top-0 right-0 bottom-0
                  w-[340px] h-full
                  bg-white/80
                  rounded-r-[1.5rem]
                  flex flex-col justify-center px-8 py-8
                  border-l border-[#ecd98b]/30
                  shadow-xl
                  backdrop-blur-[8px]
                  z-20
                "
                style={{
                  boxShadow: "0 8px 38px 0 rgba(212,175,55,0.13)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-[#ecd98b] to-[#fffbe6] rounded-full" />
                  <div className="text-[#bfa14a] font-bold text-xs tracking-widest font-mono">
                    NEWS
                  </div>
                </div>
                <ul className="space-y-4 text-[15.5px] text-[#594f28]">
                  {news.map((item: NewsItem, idx: number) => (
                    <li key={idx} className="flex flex-col">
                      <span className="text-xs text-[#bfa14a] mb-1 font-mono">
                        {item.date}
                      </span>
                      <span className="font-medium">{item.title}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-7 text-[#bfa14a] text-sm font-bold hover:underline hover:text-[#d4af37] transition">
                  すべて見る →
                </button>
              </div>
            </div>
          </div>
          {/* スマホ：画像下にNEWS欄 */}
          <div className="block sm:hidden mt-6 w-full flex justify-center">
            <div className="
              w-full max-w-[650px]
              bg-white/88
              rounded-[1.4rem]
              flex flex-col justify-center px-5 py-7 border border-[#ecd98b]/30 shadow-inner
            ">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-6 bg-gradient-to-b from-[#ecd98b] to-[#fffbe6] rounded-full" />
                <div className="text-[#bfa14a] font-bold text-xs tracking-widest font-mono">
                  NEWS
                </div>
              </div>
              <ul className="space-y-4 text-[15.2px] text-[#594f28]">
                {news.map((item: NewsItem, idx: number) => (
                  <li key={idx} className="flex flex-col">
                    <span className="text-xs text-[#bfa14a] mb-1 font-mono">
                      {item.date}
                    </span>
                    <span className="font-medium">{item.title}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-7 text-[#bfa14a] text-sm font-bold hover:underline hover:text-[#d4af37] transition">
                すべて見る →
              </button>
            </div>
          </div>
        </div>
      </section>
    </ParallaxProvider>
  );
}

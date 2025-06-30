"use client";
import React, { useEffect, useState, useRef } from "react";
import { ParallaxProvider, Parallax } from "react-scroll-parallax";
import { motion } from "framer-motion"; // framer-motionを使用

// スライドデータ
const slides = [
  {
    img1: "/0001pfoc herobanner.jpg", // 左側カード画像
    img2: "/IMG_5614.jpg", // 右側カード画像
    ctaTitle: "人を、想う力。街を、想う力。",
    ctaButton: "MESSAGE",
  },
  {
    img1: "/IMG_5614.jpg",
    img2: "/IMG_5615.jpg",
    ctaTitle: "新たな時代の一歩を。",
    ctaButton: "VIEW MORE",
  },
  {
    img1: "/IMG_5615.jpg",
    img2: "/0001pfoc herobanner.jpg",
    ctaTitle: "あなたの夢を現実に。",
    ctaButton: "JOIN US",
  },
];

// ニュースデータの型定義
type NewsItem = {
  date: string;
  title: string;
};

// ニュースデータ
const news: NewsItem[] = [
  { date: "2025.06.30", title: "新サービス開始のお知らせ" },
  { date: "2025.06.25", title: "サイトリニューアルしました" },
  { date: "2025.06.20", title: "特別イベント開催情報" },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // スライド切り替えフェード
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
        className="w-full flex justify-center items-center min-h-[560px] py-16 px-0 relative"
        style={{
          background:
            "linear-gradient(120deg, #f9fafb 0%, #f5f7fa 70%, #ecf4ef 100%)",
        }}
      >
        {/* 背景パララックス・幾何学グラデ */}
        <Parallax speed={-30} className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none">
          <svg width="100%" height="100%" viewBox="0 0 1500 540" fill="none" className="w-full h-full">
            <defs>
              <linearGradient id="heroGrad" x1="0" y1="0" x2="1600" y2="600" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fffbe6" />
                <stop offset="0.5" stopColor="#d4af37" stopOpacity="0.13" />
                <stop offset="1" stopColor="#ecf4ef" stopOpacity="0.21" />
              </linearGradient>
            </defs>
            <rect x="0" y="40" width="1500" height="420" rx="50" fill="url(#heroGrad)" />
            {/* ガラス片＆ダイヤ調 */}
            <polygon points="0,540 170,40 400,540" fill="#fffbe6" opacity="0.09" />
            <polygon points="730,490 820,90 1280,530" fill="#fff" opacity="0.06" />
            <ellipse cx="1040" cy="240" rx="70" ry="26" fill="#f6e27a" opacity="0.11" />
            {/* ラインハイライト */}
            <rect x="1250" y="90" width="160" height="8" rx="4" fill="#fffbe6" opacity="0.14" />
          </svg>
        </Parallax>
        {/* 光の筋エフェクト（手前） */}
        <Parallax speed={-12} className="absolute left-24 top-8 w-64 h-14 z-10 pointer-events-none">
          <div className="w-full h-full rounded-full bg-gradient-to-r from-white/80 via-yellow-100/70 to-transparent blur-xl opacity-60 animate-pulse" />
        </Parallax>

        {/* メインバナー・ガラスボックス */}
        <div className="w-full max-w-[1320px] mx-auto px-2 relative z-20">
          <div
            className="flex rounded-[2.2rem] bg-white/80 shadow-2xl overflow-hidden border border-[#efefef] backdrop-blur-lg relative"
            style={{
              boxShadow:
                "0 10px 54px 0 rgba(34,110,95,0.09), 0 1.5px 8px 0 rgba(212,175,55,0.12)",
            }}
          >
            {/* ヒーローイメージ＋CTA */}
            <div className="relative flex-1 min-w-[420px] h-[440px] flex items-end z-10">
              {/* 左側カード（異なる画像） */}
              <motion.div
                className="w-full h-full absolute left-0 bg-cover rounded-l-[2.2rem] z-20"
                style={{
                  backgroundImage: `url(${slide.img1})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: fade ? 1 : 0 }}
                transition={{ duration: 1 }}
              >
                <div className="absolute left-10 bottom-10 z-20 flex flex-col items-start max-w-[370px]">
                  <div className="bg-white/95 backdrop-blur-[3px] rounded-2xl px-11 py-7 shadow-xl border border-[#eee4cc]">
                    <div className="text-[1.5rem] font-semibold text-[#1d2921] mb-4 leading-snug tracking-tight font-serif">
                      {slide.ctaTitle}
                    </div>
                    <button
                      className="bg-gradient-to-r from-[#e7d38e] via-emerald-600 to-[#f7efcb]
                      text-white rounded-full px-10 py-2 text-[1.08rem] font-bold shadow-lg
                      hover:brightness-110 hover:scale-105 transition relative overflow-hidden"
                      style={{
                        boxShadow: "0 1.5px 16px 0 #d4af3721, 0 0.5px 2.5px 0 #13c3b615",
                      }}
                    >
                      <span className="relative z-10">{slide.ctaButton}</span>
                      {/* 光筋エフェクト */}
                      <span className="absolute left-2 right-2 top-0 h-[2.5px] bg-gradient-to-r from-white/70 via-yellow-100/60 to-transparent blur-[1.5px] opacity-50"></span>
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* 右側カード（異なる画像） */}
              <motion.div
                className="w-full h-full absolute right-0 bg-cover rounded-r-[2.2rem] z-20"
                style={{
                  backgroundImage: `url(${slide.img2})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: fade ? 1 : 0 }}
                transition={{ duration: 1 }}
              />
            </div>

            {/* 右ニュース欄（右の画像と重なるように配置） */}
            <div className="w-[370px] flex flex-col justify-center items-start h-[440px] px-0 z-20 absolute top-0 right-0">
              <div className="w-full h-full bg-white/70 rounded-r-[2.2rem] flex flex-col justify-center px-10 py-8 border-l border-[#e6e6e6] shadow-inner">
                <div className="text-emerald-700 font-bold text-xs mb-2 tracking-widest font-mono">
                  NEWS
                </div>
                <ul className="space-y-4 text-[15.5px] text-[#283c32]">
                  {news.map((item: NewsItem, idx: number) => (
                    <li key={idx} className="flex flex-col">
                      <span className="text-xs text-[#a9a9a9] mb-1 font-mono">
                        {item.date}
                      </span>
                      <span className="font-medium">{item.title}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-7 text-emerald-700 text-sm font-bold hover:underline hover:text-yellow-500 transition">
                  すべて見る →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ParallaxProvider>
  );
}

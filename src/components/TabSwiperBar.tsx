"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";

// タブ名を適宜変更してもOK
const tabItems = [
  "重要なお知らせ",
  "ドコモMAX／ドコモ ポイ活MAX",
  "home 5G",
  "Android",
  "iPhone",
  "ahamo",
  "ドコモ光",
  "Lemino（映像配信）",
];

export default function TabSwiperBar() {
  return (
    <div className="relative flex justify-center py-3 mb-10 max-w-full">
      {/* フェードオーバーレイ（左） */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-full w-20 
          bg-gradient-to-r from-white via-emerald-100/70 to-transparent z-30"
      />
      {/* フェードオーバーレイ（右） */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-full w-20 
          bg-gradient-to-l from-white via-gold-100/60 to-transparent z-30"
      />

      {/* 背景レイヤー（ダイヤモンドっぽい淡グラデ） */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-emerald-50 to-gold-50 opacity-70 blur-md pointer-events-none z-10" />

      <div className="w-full max-w-[1200px] px-6 relative z-20">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={28}  // 少しゆとりある間隔
          slidesPerView={"auto"}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={true}
          style={{ paddingLeft: 32, paddingRight: 32 }}
        >
          {tabItems.map((item, idx) => (
            <SwiperSlide
              key={idx}
              className="!w-auto flex"
              style={{ width: "auto" }}
            >
              <button
                className={`
                  rounded-full
                  px-8 py-2 text-[15px] font-semibold
                  shadow-sm whitespace-nowrap border transition-all duration-200
                  bg-white/80 border-emerald-100 text-[#222]
                  hover:bg-gradient-to-br hover:from-emerald-100 hover:to-gold-100
                  hover:border-gold-400 hover:text-gold-700
                  focus:outline-none focus:ring-2 focus:ring-gold-300
                `}
                style={{
                  letterSpacing: "0.03em",
                  boxShadow:
                    "0 2px 8px 0 rgba(47,125,104,0.07), 0 1px 3px 0 rgba(210,174,55,0.05)",
                  fontFamily: '"Noto Sans JP", "Yu Gothic", Arial, serif',
                }}
              >
                {item}
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

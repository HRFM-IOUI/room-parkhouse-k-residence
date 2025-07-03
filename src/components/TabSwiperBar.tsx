"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";

const tabItems = [
  "重要なお知らせ",
  "ペットのいる暮らし",
  "地域情報",
  "季節情報",
  "管理室より",
  "検討委員会活動",
  "暮らしと防災",
];

export default function TabSwiperBar() {
  return (
    <div className="relative flex justify-center py-3 mb-8 max-w-full">
      {/* フェードオーバーレイ（左） */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-full w-24 
          bg-gradient-to-r from-white via-[#f9eab5]/40 to-transparent z-30"
      />
      {/* フェードオーバーレイ（右） */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-full w-24 
          bg-gradient-to-l from-white via-[#f9eab5]/40 to-transparent z-30"
      />
      {/* 背景レイヤー（グラデ＋ガラス感） */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-[#fffbe6] to-[#ecd98b]/30 opacity-80 blur-[2px] pointer-events-none z-10" />

      <div className="w-full max-w-[1440px] px-6 relative z-20">
        <Swiper
  modules={[Autoplay]}
  spaceBetween={28}
  slidesPerView={"auto"}
  loop={true}
  autoplay={{
    delay: 0,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  }}
  speed={5000}
  freeMode={{
    enabled: true,
    momentum: false, // ここをこう書く！
  }}
  allowTouchMove={true}
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
                  rounded-[1.5rem]
                  px-8 py-2 text-[15.2px] font-semibold
                  shadow-md whitespace-nowrap border transition-all duration-200
                  bg-white/90 border-[#ecd98b] text-[#3d3300]
                  hover:bg-gradient-to-br hover:from-[#fffbe6] hover:to-[#ecd98b]
                  hover:border-[#d4af37] hover:text-[#d4af37]
                  focus:outline-none focus:ring-2 focus:ring-[#ecd98b]/50
                `}
                style={{
                  letterSpacing: "0.03em",
                  fontFamily: '"Noto Sans JP", "Yu Gothic", Arial, serif',
                  boxShadow:
                    "0 2px 8px 0 rgba(212,175,55,0.06), 0 1px 5px 0 #ececec55",
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

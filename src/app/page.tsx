"use client";
import React from "react";
import { ParallaxProvider } from "react-scroll-parallax";
import StickyBar from "@/components/StickyBar";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import FooterSection from "@/components/FooterSection";

export default function Page() {
  return (
    <ParallaxProvider>
      <div
        className="min-h-screen flex flex-col"
        style={{
          background:
            "linear-gradient(120deg, #f8fafc 0%, #f5f5f5 70%, #e0e8eb 100%)",
        }}
      >
        {/* 1. StickyBar（追尾スリムガラス帯・z-50） */}
        <StickyBar />

        {/* 2. Header本体（台座パララックス）→ StickyBarに少し重なるようズラす */}
        <Header />

        {/* 3. Heroバナー */}
        <div className="mb-10">
          <HeroBanner />
        </div>

        {/* 4. フッター */}
        <FooterSection />
      </div>
    </ParallaxProvider>
  );
}

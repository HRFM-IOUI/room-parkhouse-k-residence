"use client";
import React, { useState } from "react";
import StickyBar from "@/components/StickyBar";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import AccessibilityPanel from "@/components/AccessibilityPanel";
import AccessibilityModal from "@/components/AccessibilityModal";
import FooterSection from "@/components/FooterSection";

export default function HeroLayout() {
  const [accessOpen, setAccessOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(120deg, #f8fafc 0%, #f5f5f5 70%, #e0e8eb 100%)",
      }}
    >
      {/* 1. StickyBar（追尾スリムガラス帯・z-50） */}
      <StickyBar />

      {/* 2. Header本体 */}
      <Header />
      <div className="mb-0 sm:mb-15" /> {/* ここを追加！ */}

      {/* 3. Heroバナー */}
      <div className="mb-10 relative">
        <HeroBanner />
        {/* パネルとモーダルをProps正しく揃えて呼ぶ */}
        <AccessibilityPanel onOpen={() => setAccessOpen(true)} />
        <AccessibilityModal open={accessOpen} onClose={() => setAccessOpen(false)} />
      </div>

      {/* 4. フッター */}
      <FooterSection />
    </div>
  );
}

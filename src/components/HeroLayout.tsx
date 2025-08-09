"use client";
import React, { useState } from "react";
import StickyBar from "@/components/StickyBar";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import AccessibilityFloatingButton from "@/components/AccessibilityFloatingButton";
import AccessibilityModal from "@/components/AccessibilityModal";
import FooterSection from "@/components/FooterSection";

export default function HeroLayout() {
  const [accessOpen, setAccessOpen] = useState(false);

  return (
    <div
      // iOSの100vh問題を吸収
      className="min-h-screen supports-[height:100dvh]:min-h-[100dvh] flex flex-col overflow-x-hidden"
      style={{
        background:
          "linear-gradient(120deg, #f8fafc 0%, #f5f5f5 70%, #e0e8eb 100%)",
      }}
    >
      {/* 1. 追従バー */}
      <StickyBar />

      {/* 2. 中身は縦積み＋余白はspaceで管理 */}
      <main className="flex-1 flex flex-col space-y-6 sm:space-y-10">
        {/* Header */}
        <Header />

        {/* Heroバナー */}
        <section className="relative">
          <HeroBanner />
        </section>
      </main>

      {/* アクセシビリティUI */}
      <AccessibilityFloatingButton
        onOpen={() => setAccessOpen(true)}
        // 実装側でstyle受け取れるなら安全域を渡す（なければこの発想を中で反映）
        // style={{ position: 'fixed', left: 12, bottom: 'calc(16px + env(safe-area-inset-bottom))', zIndex: 60 }}
      />
      <AccessibilityModal
        open={accessOpen}
        onClose={() => setAccessOpen(false)}
      />

      {/* 4. フッターは一番下に固定されやすいように */}
      <FooterSection />
    </div>
  );
}

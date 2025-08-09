// ABXYDrawerModal.tsx
"use client";
import React from "react";

// 型宣言
type DrawerType = "A" | "B" | "X" | "Y" | null;

type Props = {
  openType: DrawerType;   // ←ここが絶対 openType!!
  onClose: () => void;
  children?: React.ReactNode;
};

const TITLES: Record<Exclude<DrawerType, null>, string> = {
  A: "テキスト装飾セット",
  B: "メディア＆埋め込み",
  X: "段落構造・レイアウト",
  Y: "リンク・付随機能",
};

export default function ABXYDrawerModal({ openType, onClose, children }: Props) {
  if (!openType) return null;

  return (
    <div className="drawer-bg" onClick={onClose}>
      <div className="drawer-content" onClick={e => e.stopPropagation()}>
        <div className="font-bold text-base mb-2">
          {TITLES[openType]}
        </div>
        <div className="text-gray-500 min-h-[40px]">
          {children}
        </div>
        <button className="modal-menu-btn mt-2" onClick={onClose}>閉じる</button>
      </div>
      <style>{`
        .drawer-bg {
          position: fixed; inset: 0; background: rgba(52,56,75,0.13); z-index: 1010;
          display: flex; align-items: flex-end; justify-content: center;
        }
        .drawer-content {
          width: 98vw; max-width: 450px; min-height: 130px; background: #fff;
          border-radius: 18px 18px 0 0; box-shadow: 0 -2px 16px #0002;
          padding: 24px 18px 18px 18px; animation: upDrawer .18s;
        }
        @keyframes upDrawer { from { transform: translateY(100px); opacity:0; } to { transform: none; opacity:1; } }
        .modal-menu-btn {
          margin: 8px 0; padding: 12px 2px; border-radius: 9px;
          background: #f6f8fb; color: #225; font-weight: 600; font-size: 1.09rem; border: none;
          transition: background 0.15s;
        }
        .modal-menu-btn:hover, .modal-menu-btn:focus {
          background: #d0eaff;
        }
      `}</style>
    </div>
  );
}

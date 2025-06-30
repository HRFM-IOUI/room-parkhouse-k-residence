"use client";
import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (blockType: string) => void;
  blockTypes?: { type: string; icon: string; label: string }[];
};

const DEFAULT_BLOCKS = [
  { type: "heading", icon: "🔠", label: "見出し" },
  { type: "text", icon: "✏️", label: "テキスト" },
  { type: "image", icon: "🖼️", label: "画像" },
  { type: "video", icon: "🎬", label: "動画" },
];

export default function BlockLauncherMenu({
  open,
  onClose,
  onSelect,
  blockTypes = DEFAULT_BLOCKS
}: Props) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(40,56,77,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "slideIn 0.25s cubic-bezier(.7,1.8,.3,1.3)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#e6ebf2",
          borderRadius: 24,
          boxShadow: "0 8px 48px #0005",
          padding: "26px 28px",
          minWidth: 320,
          maxWidth: 430,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 19,
          animation: "launcherAppear .18s"
        }}
        onClick={e => e.stopPropagation()}
      >
        {blockTypes.map(block => (
          <button
            key={block.type}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center",
              background: "#fff",
              border: "2.5px solid #bccbe9",
              borderRadius: 17,
              fontWeight: 900,
              fontSize: 18,
              padding: "17px 5px 8px 5px",
              minHeight: 95,
              boxShadow: "0 1.5px 7px #92caf1aa",
              cursor: "pointer",
              transition: "background .14s"
            }}
            onClick={() => onSelect(block.type)}
          >
            <span style={{ fontSize: 32, marginBottom: 8 }}>{block.icon}</span>
            <span>{block.label}</span>
          </button>
        ))}
      </div>
      {/* アニメーション */}
      <style>
        {`
        @keyframes slideIn {
          from { opacity:0; transform: translateX(50vw);}
          to { opacity:1; transform: none;}
        }
        @keyframes launcherAppear {
          from { opacity:0; transform: scale(.92);}
          to { opacity:1; transform: none;}
        }
        `}
      </style>
    </div>
  );
}

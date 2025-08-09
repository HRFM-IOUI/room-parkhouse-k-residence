"use client";

import React from "react";

const ICONS = [
  { key: "post", label: "記事投稿", svg: (
    <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.004 1.004 0 0 0 0-1.42l-2.34-2.34a1.004 1.004 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg>
  )},
  { key: "edit", label: "記事編集", svg: (
    <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.004 1.004 0 0 0 0-1.42l-2.34-2.34a1.004 1.004 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg>
  )},
  { key: "list", label: "記事一覧", svg: (
    <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zm0-10v2h14V7H7z"/></svg>
  )},
  { key: "video", label: "動画投稿", svg: (
    <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M17 10.5V7c0-1.1-.9-2-2-2H5C3.9 5 3 5.9 3 7v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-3.5l4 4v-11l-4 4z"/></svg>
  )},
  { key: "media", label: "メディア", svg: (
    <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8 14l2.03 2.71L14 13l4 5H6l2-3z"/></svg>
  )},
  { key: "community", label: "コミュニティ", svg: (
    <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2 0-6 1-6 3v3h12v-3c0-2-4-3-6-3zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45v3h6v-3c0-2-4-3-6-3z"/></svg>
  )},
  { key: "member", label: "会員管理", svg: (
    <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
  )},
  { key: "analytics", label: "アナリティクス", svg: (
    <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M3 17h2v-7H3v7zm4 0h2v-4H7v4zm4 0h2v-9h-2v9zm4 0h2v-5h-2v5zm4 0h2v-2h-2v2z"/></svg>
  )},
  { key: "add", label: "+追加", svg: (
    <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6v-2z"/></svg>
  )},
];

export default function Dashboard() {
  // ここで必要に応じてstateやイベントを追加ください
  const handleClick = (key: string) => {
    console.log(`${key} アイコンが押されました`);
    // ここでルーティングやモーダル展開などの処理を拡張可能
  };

  return (
    <div
      style={{
        background: "#fff",
        height: "100vh",
        width: "100vw",
        padding: 20,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        userSelect: "none",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1
        style={{
          color: "#f70031",
          fontWeight: "bold",
          fontSize: 36,
          marginBottom: 40,
          userSelect: "text",
        }}
      >
        RooM
      </h1>

      <div
        style={{
          width: "100%",
          maxWidth: 360,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
        }}
      >
        {ICONS.map(({ key, label, svg }) => (
          <button
            key={key}
            onClick={() => handleClick(key)}
            style={{
              aspectRatio: "1 / 1",
              borderRadius: 24,
              border: "none",
              background: "linear-gradient(135deg, #f70031 0%, #d4af37 100%)",
              boxShadow: "0 4px 12px rgba(215, 120, 40, 0.5)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              fontWeight: "600",
              fontSize: 14,
              cursor: "pointer",
              userSelect: "none",
              transition: "transform 0.15s ease-in-out",
              WebkitTapHighlightColor: "transparent",
            }}
            onMouseDown={e => (e.currentTarget.style.transform = "scale(0.95)")}
            onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ width: 48, height: 48 }}>{svg}</div>
            <span style={{ marginTop: 10, userSelect: "text" }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

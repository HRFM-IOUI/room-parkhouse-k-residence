"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase";
import VideoEditor from "@/components/dashboard/VideoEditor";
import Loading from "@/components/Loading";
import Head from "next/head";

const ICONS = [
  { key: "post", label: "記事投稿", route: "/dashboard/posts",
    svg: (<svg viewBox="0 0 24 24" fill="white"><path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6v-2z"/></svg>) },
  { key: "edit", label: "記事管理", route: "/dashboard/posts-list",
    svg: (<svg viewBox="0 0 24 24" fill="white"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.004 1.004 0 0 0 0-1.42l-2.34-2.34a1.004 1.004 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg>) },
  { key: "media", label: "メディア管理", route: "/dashboard/media",
    svg: (<svg viewBox="0 0 24 24" fill="white"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="13" r="2.2"/><path d="M21 19l-5.3-6.2a1.3 1.3 0 0 0-2 0L8 17l-3-4-3 6h20z"/></svg>) },
  { key: "archive", label: "アーカイブ管理", route: "/dashboard/archive",
    svg: (<svg viewBox="0 0 24 24" fill="white"><rect x="3" y="5" width="18" height="4" rx="2"/><rect x="3" y="10" width="18" height="9" rx="2"/><rect x="7" y="14" width="10" height="3" rx="1"/></svg>) },
  { key: "video", label: "動画投稿", route: "",
    svg: (<svg viewBox="0 0 24 24" fill="white"><path d="M17 10.5V7c0-1.1-.9-2-2-2H5C3.9 5 3 5.9 3 7v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-3.5l4 4v-11l-4 4z"/></svg>) },
  { key: "analytics", label: "アナリティクス", route: "/dashboard/analytics",
    svg: (<svg viewBox="0 0 24 24" fill="white"><path d="M2 12l5 5l5-5l5 5l5-5v10H2z"/></svg>) },
];

export default function Dashboard() {
  const router = useRouter();
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (loading) return;

    (async () => {
      if (!user) {
        router.replace("/login");
        return;
      }
      // 念のため最新トークンへ更新（claims/email反映取りこぼし防止）
      await user.getIdToken(true);

      // メールはコードに残さず、APIで照会
      const res = await fetch("/api/allowed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      if (!res.ok) {
        await auth.signOut();
        router.replace("/");
      }
    })();
  }, [user, loading, router]);

  if (loading || !user) return <Loading />;

  const handleClick = (icon: typeof ICONS[number]) => {
    if (icon.key === "video") setVideoModalOpen(true);
    else if (icon.route) router.push(icon.route);
  };

  const handleGoHome = () => router.push("/");

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <title>ダッシュボード | サイト名</title>
      </Head>

      <div
        style={{
          background: "#fff",
          minHeight: "100vh",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        {/* タイトル・ナビ */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 38, gap: 12, userSelect: "text" }}>
          <button
            onClick={handleGoHome}
            style={{
              background: "rgba(247,0,49,.12)",
              color: "#f70031",
              border: "1.3px solid #f70031",
              borderRadius: 22,
              fontWeight: 700,
              fontSize: 16,
              padding: "6px 13px 6px 10px",
              marginRight: 7,
              boxShadow: "0 2px 8px #f7003111",
              display: "flex",
              alignItems: "center",
              gap: 5,
              cursor: "pointer",
              transition: "background 0.13s",
              outline: "none",
            }}
            aria-label="トップページへ"
          >
            <span style={{ fontSize: 20, marginRight: 3 }}>🏠</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>ホーム</span>
          </button>

          <h1 style={{ color: "#f70031", fontWeight: "bold", fontSize: 34, margin: 0 }}>
            R∞Mダッシュボード
          </h1>
        </div>

        {/* メニューグリッド */}
        <div
          style={{
            width: "100%",
            maxWidth: 430,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 22,
            marginBottom: 40,
          }}
        >
          {ICONS.map((icon) => (
            <button
              key={icon.key}
              onClick={() => handleClick(icon)}
              style={{
                aspectRatio: "1 / 1",
                borderRadius: 21,
                border: "none",
                background: "linear-gradient(135deg, #f70031 0%, #d4af37 100%)",
                boxShadow: "0 4px 12px rgba(215, 120, 40, 0.5)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontWeight: "700",
                fontSize: 15,
                cursor: "pointer",
                userSelect: "none",
                transition: "transform 0.13s",
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              aria-label={icon.label}
            >
              <div style={{ width: 44, height: 44 }}>{icon.svg}</div>
              <span style={{ marginTop: 8, userSelect: "text" }}>{icon.label}</span>
            </button>
          ))}
        </div>

        {/* 動画投稿モーダル */}
        {videoModalOpen && (
          <div
            style={{
              position: "fixed", inset: 0, background: "rgba(24,32,55,.33)",
              zIndex: 100, display: "flex", justifyContent: "center", alignItems: "center",
            }}
          >
            <div
              style={{
                background: "#fff", borderRadius: 16, boxShadow: "0 8px 40px #22336622",
                padding: "30px 0 10px 0", minWidth: 360, minHeight: 440, position: "relative",
              }}
            >
              <button
                style={{
                  position: "absolute", top: 12, right: 17, background: "none",
                  border: "none", fontSize: 23, fontWeight: 700, color: "#888", cursor: "pointer",
                }}
                onClick={() => setVideoModalOpen(false)}
                aria-label="閉じる"
              >
                ×
              </button>
              <VideoEditor />
            </div>
          </div>
        )}

        {/* レスポンシブ調整 */}
        <style>{`
          @media (max-width: 600px) {
            h1 { font-size: 21px !important; }
            div[style*="grid"] { max-width: 99vw !important; gap: 11px !important; }
            button[aria-label] { font-size: 13.5px !important; border-radius: 13px !important; }
            div[style*="minWidth: 360px"] { min-width: 98vw !important; }
          }
        `}</style>
      </div>
    </>
  );
}

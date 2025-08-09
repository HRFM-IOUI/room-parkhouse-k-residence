"use client";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
  query,
  orderBy,
  deleteDoc,
  doc, // ←絶対必要！
} from "firebase/firestore";

type Post = {
  id: string;
  title?: string;
  createdAt?: Date | null;
  tags?: string[];
  category?: string;
  highlight?: boolean;
  status?: string; // "published" | "draft" | undefined
};
type SortKey = "newest" | "highlight" | "category" | "title";

export default function PostsListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sort, setSort] = useState<SortKey>("newest");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = collection(db, "posts");
        let docsSnap;
        if (sort === "newest") {
          docsSnap = await getDocs(query(q, orderBy("createdAt", "desc")));
        } else if (sort === "highlight") {
          docsSnap = await getDocs(query(q, orderBy("highlight", "desc"), orderBy("createdAt", "desc")));
        } else if (sort === "category") {
          docsSnap = await getDocs(query(q, orderBy("category", "asc"), orderBy("createdAt", "desc")));
        } else if (sort === "title") {
          docsSnap = await getDocs(query(q, orderBy("title", "asc")));
        } else {
          docsSnap = await getDocs(query(q, orderBy("createdAt", "desc")));
        }
        setPosts(
          docsSnap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            let createdAt: Date | null = null;
            if (data.createdAt?.seconds) createdAt = new Date(data.createdAt.seconds * 1000);
            return {
              id: doc.id,
              title: data.title,
              createdAt,
              tags: data.tags || [],
              category: data.category,
              highlight: data.highlight,
              status: data.status,
            };
          })
        );
      } finally {}
    };
    fetchPosts();
  }, [sort]);

  // 編集・ページ遷移
  const handleNewPost = () => router.push("/dashboard/posts");
  const handleEdit = (id: string) => router.push(`/dashboard/posts/${id}/edit`);
  const handleGoDashboard = () => router.push("/dashboard");

  // チェックボックス切り替え
  const toggleSelect = (id: string) => {
    setSelectedIds(selected =>
      selected.includes(id)
        ? selected.filter(_id => _id !== id)
        : [...selected, id]
    );
  };

  // 全選択/解除
  const handleSelectAll = () => {
    if (selectedIds.length === posts.length) setSelectedIds([]);
    else setSelectedIds(posts.map(p => p.id));
  };

  // 削除
  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`選択した${selectedIds.length}件を削除しますか？`)) return;
    setDeleting(true);
    try {
      await Promise.all(selectedIds.map(id => deleteDoc(doc(db, "posts", id))));
      setPosts(posts => posts.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    } catch {
      alert("削除に失敗しました。");
    } finally {
      setDeleting(false);
    }
  };

  // 公開・下書きバッジ
  const getStatusBadge = (status?: string) => {
    if (status === "published")
      return (
        <span className="status-badge" style={{
          background: "#13ba7b",
          color: "#fff",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 900,
          padding: "1.5px 10px",
          marginRight: 7,
          letterSpacing: 1,
        }}>
          公開
        </span>
      );
    if (status === "draft")
      return (
        <span className="status-badge" style={{
          background: "#fcb900",
          color: "#fff",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 900,
          padding: "1.5px 10px",
          marginRight: 7,
          letterSpacing: 1,
        }}>
          下書き
        </span>
      );
    return null;
  };

  return (
        <>
      <Head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <title>記事編集・一覧 | ダッシュボード</title>
      </Head>
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#faf9f7 80%,#fbeee8 100%)",
      padding: 0,
      position: "relative",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 0 60px 0" }}>
        {/* ヘッダー */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px 14px", borderBottom: "1.5px solid #eee",
          background: "rgba(255,255,255,0.95)", position: "sticky", top: 0, zIndex: 10,
        }}>
          <h1 style={{
            fontWeight: 900, fontSize: 26, color: "#f70031", letterSpacing: 2,
            margin: 0, textShadow: "0 2px 10px #f700311a"
          }}>記事編集・一覧</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleGoDashboard} style={{
              background: "#fff", color: "#f70031", border: "1.2px solid #f70031",
              borderRadius: 11, fontWeight: 900, fontSize: 15, padding: "9px 17px",
              cursor: "pointer", marginRight: 4, boxShadow: "0 2px 10px #f7003112"
            }}>🏠 トップへ</button>
            <button onClick={handleNewPost} style={{
              background: "linear-gradient(90deg,#f70031 0%,#d4af37 100%)",
              color: "#fff", border: "none", borderRadius: 11, fontWeight: 800,
              fontSize: 16, padding: "9px 22px", boxShadow: "0 2px 12px #e36b251a",
              cursor: "pointer", marginLeft: 4,
            }}>＋ 新規投稿</button>
          </div>
        </div>

        {/* ソート+削除UI */}
        <div style={{
          display: "flex", gap: 16, alignItems: "center", margin: "18px 0 4px 0", paddingLeft: 7
        }}>
          <label style={{ fontWeight: 700, fontSize: 15, color: "#192349" }}>並び順:</label>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            style={{
              fontWeight: 700, borderRadius: 8, border: "1.2px solid #c7d1ee",
              padding: "7px 17px", fontSize: 16, color: "#223366", background: "#fff"
            }}
          >
            <option value="newest">新着順</option>
            <option value="highlight">ハイライト順</option>
            <option value="category">カテゴリ順</option>
            <option value="title">タイトルA-Z</option>
          </select>
          <button
            onClick={handleSelectAll}
            style={{
              border: "1px solid #b3c7e7", borderRadius: 7, background: "#f7fafd",
              color: "#555", padding: "6px 10px", fontWeight: 700, fontSize: 14, marginLeft: 6, cursor: "pointer"
            }}>
            {selectedIds.length === posts.length ? "全解除" : "全選択"}
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={!selectedIds.length || deleting}
            style={{
              background: selectedIds.length ? "linear-gradient(90deg,#f70031 20%,#d4af37 90%)" : "#eee",
              color: selectedIds.length ? "#fff" : "#bbb", border: "none", borderRadius: 8, fontWeight: 900,
              fontSize: 14, padding: "6px 15px", boxShadow: "0 2px 8px #f7003122", marginLeft: 5, cursor: selectedIds.length ? "pointer" : "default"
            }}>
            {deleting ? "削除中…" : `選択削除`}
          </button>
        </div>

        {/* 一覧 */}
        <ul style={{
          listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14,
        }}>
          {posts.map(post => (
            <li key={post.id}
              style={{
                borderRadius: 18, background: post.highlight
                  ? "linear-gradient(90deg,#fff7f2 60%,#fef2f2 100%)" : "#fff",
                boxShadow: "0 4px 16px #22336611", border: "1.2px solid #ececf4",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 10, padding: "18px 15px", cursor: "pointer",
                transition: "box-shadow .18s, background .18s", position: "relative", minHeight: 76, overflow: "hidden"
              }}>
              {/* チェックボックス */}
              <input
                type="checkbox"
                checked={selectedIds.includes(post.id)}
                onClick={e => e.stopPropagation()}
                onChange={() => toggleSelect(post.id)}
                style={{ marginRight: 13, width: 19, height: 19, accentColor: "#f70031" }}
                aria-label="選択"
              />
              <div
                onClick={() => handleEdit(post.id)}
                style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}
              >
                {/* タイトルの前にバッジ */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontWeight: 800, fontSize: 17, color: "#223366", textOverflow: "ellipsis",
                  overflow: "hidden", whiteSpace: "nowrap", maxWidth: "99vw"
                }}>
                  {getStatusBadge(post.status)}
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {post.title || "(無題)"}
                  </span>
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
                  color: "#98a3ba", fontSize: 13, marginTop: 1, minHeight: 22
                }}>
                  <span style={{ fontWeight: 600 }}>
                    {post.createdAt ? post.createdAt.toLocaleString() : ""}
                  </span>
                  {post.category && (
                    <span style={{
                      color: "#f70031", fontWeight: 700, fontSize: 13, background: "#f7dde1",
                      padding: "1.5px 10px", borderRadius: 7,
                    }}>
                      {post.category}
                    </span>
                  )}
                  {post.tags?.length ? (
                    <span style={{
                      display: "flex", gap: 3, flexWrap: "wrap"
                    }}>
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} style={{
                          color: "#5b8dee", background: "#eaf2ff", borderRadius: 6,
                          fontSize: 12.5, padding: "1px 8px", fontWeight: 700
                        }}>
                          #{tag}
                        </span>
                      ))}
                      {post.tags.length > 3 &&
                        <span style={{ color: "#5b8dee" }}>…</span>
                      }
                    </span>
                  ) : null}
                </div>
              </div>
              <button
                onClick={event => {
                  event.stopPropagation();
                  handleEdit(post.id);
                }}
                style={{
                  background: "linear-gradient(90deg,#f70031 20%,#d4af37 90%)",
                  color: "#fff", border: "none", borderRadius: 9,
                  fontWeight: 800, fontSize: 14, padding: "8px 18px", marginLeft: 10,
                  boxShadow: "0 2px 10px #e36b251a", cursor: "pointer", whiteSpace: "nowrap"
                }}
                aria-label="編集"
              >
                編集
              </button>
              {post.highlight && (
                <div style={{
                  position: "absolute", top: 8, right: 10, fontWeight: 900,
                  color: "#f70031", fontSize: 15, background: "#fff",
                  borderRadius: 7, padding: "1.5px 8px", boxShadow: "0 2px 8px #f7003120", opacity: 0.97
                }}>
                  ★
                </div>
              )}
            </li>
          ))}
        </ul>
      </main>
      {/* フローティング新規ボタン */}
      <button
        onClick={handleNewPost}
        style={{
          position: "fixed", right: 24, bottom: 24, zIndex: 80,
          background: "linear-gradient(135deg,#f70031 0%,#d4af37 100%)",
          color: "#fff", border: "none", borderRadius: "50%",
          width: 60, height: 60, fontWeight: 900, fontSize: 32,
          boxShadow: "0 4px 18px #d4af3722", cursor: "pointer",
          display: "flex", justifyContent: "center", alignItems: "center", transition: "opacity .12s",
        }}
        aria-label="新規投稿"
      >＋</button>
      {/* スマホ最適化 */}
      <style>
        {`
          @media (max-width: 600px) {
            main {
              padding: 10px 2vw 80px 2vw !important;
              max-width: 99vw !important;
            }
            h1 { font-size: 20px !important; padding-top: 10px !important; }
            ul { gap: 7px !important; }
            li { padding: 14px 8px !important; font-size: 15px !important; }
            .status-badge {
              font-size: 11px !important;
              padding: 1px 8px !important;
              margin-right: 5px !important;
              margin-left: 0 !important;
            }
          }
        `}
      </style>
    </div>
    </>
  );
}

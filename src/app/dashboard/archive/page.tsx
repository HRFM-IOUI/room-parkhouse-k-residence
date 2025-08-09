"use client";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, storage } from "@/firebase";
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  FaFilePdf,
  FaFileImage,
  FaDownload,
  FaRegEye,
  FaTrash,
} from "react-icons/fa";
import Image from "next/image";

// カテゴリ
const CATEGORIES = [
  "都議会議員選挙にあたっての確認",
  "パンフレット",
  "区政報告 / SEIJI_PAPER",
  "政策資料",
];

// 型定義
type ArchiveItem = {
  id: string;
  category: string;
  title: string;
  url: string;
  storagePath?: string;
  type: "pdf" | "img";
  createdAt?: unknown;
  thumbnail?: string;
};

export default function ArchiveAdmin() {
  const router = useRouter();

  const [category, setCategory] = useState(CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchArchives() {
    setLoading(true);
    const q = query(collection(db, "archives"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const newItems: ArchiveItem[] = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        category: data.category ?? "",
        title: data.title ?? "",
        url: data.url ?? "",
        storagePath: data.storagePath,
        type: data.type === "pdf" ? "pdf" : "img",
        createdAt: data.createdAt,
        thumbnail: data.thumbnail ?? undefined,
      };
    });
    setItems(newItems);
    setLoading(false);
  }
  useEffect(() => {
    fetchArchives();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title) return;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const fileRef = ref(storage, `archives/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const fileUrl = await getDownloadURL(fileRef);

    await addDoc(collection(db, "archives"), {
      category,
      title,
      url: fileUrl,
      storagePath: fileRef.fullPath,
      type: ext?.toLowerCase().startsWith("pdf") ? "pdf" : "img",
      createdAt: serverTimestamp(),
    });
    setUploading(false);
    setTitle("");
    setFile(null);
    await fetchArchives();
    alert("登録しました！");
  }

  async function handleDelete(id: string, storagePath?: string) {
    if (!window.confirm("削除してよいですか？")) return;
    await deleteDoc(doc(db, "archives", id));
    if (storagePath) {
      await deleteObject(ref(storage, storagePath)).catch(() => {});
    }
    await fetchArchives();
  }

  // サムネ or アイコン
  function getFileIcon(item: ArchiveItem) {
    if (item.type === "pdf" && item.thumbnail) {
      return (
        <Image
          src={item.thumbnail}
          alt={item.title}
          width={32}
          height={40}
          unoptimized
          style={{
            objectFit: "contain",
            borderRadius: 7,
            background: "#fff",
            boxShadow: "0 2px 8px #0001"
          }}
        />
      );
    }
    if (item.type === "img" && item.url) {
      return (
        <Image
          src={item.url}
          alt={item.title}
          width={32}
          height={40}
          unoptimized
          style={{
            objectFit: "contain",
            borderRadius: 7,
            background: "#fff",
            boxShadow: "0 2px 8px #0001"
          }}
        />
      );
    }
    return item.type === "pdf"
      ? <FaFilePdf color="#d00" size={22} />
      : <FaFileImage color="#2996ff" size={22} />;
  }

  const grouped = CATEGORIES.map((cat) => ({
    name: cat,
    items: items.filter((i) => i.category === cat),
  }));

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <title>アーカイブ管理 | ダッシュボード</title>
      </Head>
      <div className="archive-admin-root">
        {/* ←ダッシュボードに戻るナビ */}
        <div
          style={{
            position: "sticky",
            top: 0,
            left: 0,
            zIndex: 5,
            background: "#fff",
            paddingBottom: 6,
            marginBottom: 10,
          }}
        >
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "#295ef7",
              background: "none",
              border: "none",
              fontSize: "1.08rem",
              fontWeight: 700,
              cursor: "pointer",
              padding: "2px 2px 2px 0",
              marginLeft: 0,
            }}
            aria-label="ダッシュボードトップへ戻る"
          >
            <span style={{ fontSize: "1.25em" }}>←</span>
            <span>ダッシュボードへ戻る</span>
          </button>
        </div>

        <h2 className="archive-title">アーカイブ管理</h2>

        {/* 登録フォーム */}
        <form className="archive-form" onSubmit={handleSubmit}>
          <select
            className="archive-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input
            className="archive-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトル"
            required
          />
          <input
            className="archive-file"
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
          <button className="archive-btn" type="submit" disabled={uploading}>
            {uploading ? "アップ中..." : "追加"}
          </button>
        </form>

        {/* カテゴリごと一覧 */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#888", marginTop: 26 }}>
            読み込み中...
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.name} className="archive-category-block">
              <h3 className="archive-category">{group.name}</h3>
              {group.items.length === 0 ? (
                <div className="archive-nodata">まだ登録なし</div>
              ) : (
                <ul className="archive-list">
                  {group.items.map((item) => (
                    <li key={item.id} className="archive-listitem">
                      <span className="archive-fileicon">
                        {getFileIcon(item)}
                      </span>
                      <span className="archive-filename">{item.title}</span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="archive-action archive-view"
                      >
                        <FaRegEye /> 見る
                      </a>
                      <a
                        href={item.url}
                        download
                        className="archive-action archive-dl"
                      >
                        <FaDownload /> DL
                      </a>
                      <button
                        onClick={() => handleDelete(item.id, item.storagePath)}
                        className="archive-action archive-delete"
                      >
                        <FaTrash />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}

        {/* スタイル：モバイルファースト */}
        <style>{`
          .archive-admin-root {
            max-width: 450px;
            margin: 0 auto;
            padding: 20px 7px 40px 7px;
            background: #fff;
          }
          .archive-title {
            font-size: 1.45rem;
            font-weight: bold;
            margin-bottom: 22px;
            text-align: center;
            color: #f70031;
          }
          .archive-form {
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: #fafbfc;
            padding: 16px 12px;
            border-radius: 15px;
            margin-bottom: 32px;
          }
          .archive-select, .archive-input, .archive-file, .archive-btn {
            font-size: 1rem;
            border-radius: 9px;
            border: 1px solid #ccc;
            padding: 11px;
            margin: 0;
          }
          .archive-btn {
            background: linear-gradient(90deg, #f70031 50%, #ffa726 100%);
            color: #fff;
            font-weight: bold;
            border: none;
            box-shadow: 0 2px 7px #f7003123;
            transition: filter .12s;
          }
          .archive-btn:active {
            filter: brightness(.92);
          }
          .archive-category-block {
            margin-bottom: 28px;
          }
          .archive-category {
            font-size: 1.06rem;
            color: #18377d;
            font-weight: 700;
            margin: 13px 0 8px 4px;
          }
          .archive-nodata {
            color: #aaa;
            font-size: .99rem;
            margin: 0 0 10px 12px;
          }
          .archive-list {
            list-style: none;
            margin: 0;
            padding: 0;
          }
          .archive-listitem {
            display: flex;
            align-items: center;
            background: #f6f8fa;
            margin-bottom: 7px;
            border-radius: 10px;
            padding: 9px 7px;
            gap: 9px;
          }
          .archive-fileicon { flex-shrink: 0; }
          .archive-filename {
            flex: 1;
            min-width: 0;
            font-size: 1rem;
            color: #24292f;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .archive-action {
            border: none;
            background: none;
            font-size: 1.05rem;
            padding: 4px 5px;
            margin-left: 2px;
            border-radius: 7px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 2px;
          }
          .archive-view { color: #295ef7; }
          .archive-dl { color: #1bb87f; }
          .archive-delete { color: #ff4747; }
          @media (max-width: 600px) {
            .archive-admin-root { max-width: 97vw; padding: 7vw 1.5vw 22vw 1.5vw;}
            .archive-form { padding: 13px 3px; }
            .archive-title { font-size: 1.05rem; }
            .archive-listitem { font-size: .99rem; padding: 8px 4px; gap: 7px;}
            .archive-filename { font-size: .99rem; }
          }
        `}</style>
      </div>
    </>
  );
}

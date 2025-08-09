// src/app/dashboard/media/page.tsx
"use client";
import Head from "next/head";
import React, { useState, useRef, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { db, storage, auth } from "@/firebase";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const LABELS = {
  upload: "画像/動画をアップロード",
  uploading: "アップロード中...",
  uploaded: "アップロード完了",
  uploadError: "アップロード失敗",
  searchPlaceholder: "タイトルまたはタグ",
  urlCopied: "URLをコピーしました！",
  save: "保存",
  cancel: "キャンセル",
  edit: "編集",
  delete: "削除",
  deleted: "削除しました",
  deleteConfirm: "本当に削除しますか？",
  editing: "編集中...",
  saveSuccess: "保存しました",
  saveError: "保存失敗",
  items: "件表示中",
  preview: "プレビュー",
};
const TAG_COLORS = ["#5b8dee", "#f56c6c", "#1abc9c", "#fbc531", "#e17055", "#00b894", "#192349"];

type MediaItem = {
  id: string;
  url: string;
  thumbnailUrl?: string;
  name: string;
  type: "image" | "video";
  tags?: string[];
  createdAt?: Date | null;
};

export default function MediaLibrary() {
  const router = useRouter();
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "video" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTags, setEditTags] = useState<string>("");
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<MediaItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 一覧取得
  useEffect(() => { fetchMedia(); }, []);
  // フィルタ
  useEffect(() => {
    let list = [...mediaList];
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter(
        m =>
          m.name?.toLowerCase().includes(s) ||
          (m.tags && m.tags.some(tag => tag.toLowerCase().includes(s))),
      );
    }
    setFiltered(list);
  }, [search, mediaList]);

  async function fetchMedia() {
    const snap = await getDocs(query(collection(db, "media"), orderBy("createdAt", "desc")));
    setMediaList(
      snap.docs.map(d => {
        const data = d.data() as any;
        return {
          id: d.id,
          url: data.url,
          thumbnailUrl: data.thumbnailUrl,
          name: data.name,
          type: data.type,
          tags: data.tags || [],
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ?? null),
        } as MediaItem;
      }),
    );
  }

  // 動画サムネ抽出
  function extractThumbnail(file: File, seekTo = 1.0): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = URL.createObjectURL(file);
      video.muted = true;
      video.currentTime = seekTo;
      video.onloadeddata = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          blob => (blob ? resolve(blob) : reject(new Error("サムネイル生成失敗"))),
          "image/jpeg",
          0.92,
        );
      };
      video.onerror = () => reject(new Error("動画読み込み失敗"));
    });
  }

  // アップロード（contentType必須／resumable）
  async function uploadWithMeta(path: string, fileOrBlob: File | Blob, contentType: string) {
    const r = ref(storage, path);
    const task = uploadBytesResumable(r, fileOrBlob, { contentType });
    await new Promise<void>((resolve, reject) => {
      task.on("state_changed", undefined, reject, () => resolve());
    });
    return await getDownloadURL(r);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!auth.currentUser) {
      toast.error("ログインが必要です");
      return;
    }

    setUploading(true);
    toast.loading(LABELS.uploading, { id: "upload" });

    try {
      // 認可安定のためトークン更新
      await auth.currentUser.getIdToken(true);

      const isImage = file.type.startsWith("image");
      const extType: "image" | "video" = isImage ? "image" : "video";
      const now = Date.now();
      const safeName = file.name.replace(/\s+/g, "_");
      const baseKey = `media/${safeName}_${now}`;

      // 本体アップロード
      const fileUrl = await uploadWithMeta(
        baseKey,
        file,
        file.type || "application/octet-stream",
      );

      // 動画ならサムネイル
      let thumbnailUrl: string | undefined;
      if (extType === "video") {
        try {
          const thumbBlob = await extractThumbnail(file, 1.0);
          thumbnailUrl = await uploadWithMeta(`${baseKey}_thumb.jpg`, thumbBlob, "image/jpeg");
        } catch (err) {
          console.warn("サムネイル自動生成に失敗", err);
        }
      }

      // Firestore 登録（undefinedは含めない）
      const data = {
        url: fileUrl,
        name: file.name,
        type: extType,
        tags: [] as string[],
        createdAt: serverTimestamp(),
        ...(thumbnailUrl ? { thumbnailUrl } : {}),
      };

      await addDoc(collection(db, "media"), data);
      await fetchMedia();
      toast.success(LABELS.uploaded, { id: "upload" });
    } catch (err) {
      console.error(err);
      toast.error(LABELS.uploadError, { id: "upload" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(item: MediaItem) {
    if (!window.confirm(LABELS.deleteConfirm)) return;
    try {
      await deleteDoc(doc(db, "media", item.id));
      fetchMedia();
      toast.success(LABELS.deleted);
    } catch {
      toast.error(LABELS.saveError);
    }
  }

  function startEdit(item: MediaItem) {
    setEditId(item.id);
    setEditTitle(item.name);
    setEditTags((item.tags || []).join(" "));
  }

  async function saveEdit(id: string) {
    toast.loading(LABELS.editing, { id: "save" });
    try {
      await updateDoc(doc(db, "media", id), {
        name: editTitle.trim(),
        tags: editTags.split(" ").map(t => t.trim()).filter(Boolean),
      });
      setEditId(null);
      setEditTitle("");
      setEditTags("");
      fetchMedia();
      toast.success(LABELS.saveSuccess, { id: "save" });
    } catch {
      toast.error(LABELS.saveError, { id: "save" });
    }
  }

  function openPreview(item: MediaItem) {
    setPreviewUrl(item.thumbnailUrl || item.url);
    setPreviewType(item.type);
  }

  function handleCopy(url: string) {
    navigator.clipboard.writeText(url);
    toast.success(LABELS.urlCopied);
  }

  function filterByTag(tag: string) { setSearch(tag); }

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <title>メディア管理 | ダッシュボード</title>
      </Head>

      <div
        style={{
          display: "flex",
          gap: 22,
          alignItems: "flex-start",
          flexWrap: "wrap",
          width: "100%",
          minHeight: 400,
          background: "#f6f6fb",
          borderRadius: 16,
          marginTop: 14,
          boxShadow: "0 2px 18px #19234910",
        }}
      >
        <Toaster position="top-center" />

        {/* 戻る */}
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            background: "#f70031",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 14,
          }}
        >
          ダッシュボードトップに戻る
        </button>

        {/* サイドバー */}
        <aside
          style={{
            minWidth: 210,
            maxWidth: 240,
            borderRight: "1px solid #eee",
            padding: 13,
            background: "#fff",
            borderRadius: 14,
            marginBottom: 18,
          }}
        >
          <div style={{ fontWeight: 900, color: "#223366", fontSize: 18, marginBottom: 11 }}>
            検索・タグ
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={LABELS.searchPlaceholder}
            style={{
              width: "100%",
              marginBottom: 18,
              padding: 7,
              borderRadius: 8,
              border: "1.3px solid #d7e2ed",
              fontSize: 16,
              color: "#223366",
            }}
            aria-label={LABELS.searchPlaceholder}
          />
          <div style={{ fontWeight: 700, fontSize: 14, color: "#223366", marginBottom: 6 }}>
            タグで絞込
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {[...new Set(mediaList.flatMap(i => i.tags || []))].map((tag, i) => (
              <span
                key={`tag-${tag}-${i}`}
                onClick={() => filterByTag(tag)}
                style={{
                  background: TAG_COLORS[i % TAG_COLORS.length],
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: 9,
                  padding: "3px 11px",
                  fontSize: 13,
                  cursor: "pointer",
                  marginBottom: 3,
                }}
                aria-label={`Filter by tag: #${tag}`}
              >
                #{tag}
              </span>
            ))}
          </div>
        </aside>

        {/* メイン */}
        <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
          {/* アップロードUI */}
          <div
            style={{
              marginBottom: 18,
              padding: 11,
              background: "#f8f8fb",
              borderRadius: 11,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 7,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              style={{ display: "none" }}
              onChange={handleUpload}
              aria-label={LABELS.upload}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: "#1abc9c",
                color: "#fff",
                fontWeight: 900,
                padding: "9px 21px",
                border: "none",
                borderRadius: 9,
                fontSize: 16,
                cursor: uploading ? "not-allowed" : "pointer",
                opacity: uploading ? 0.68 : 1,
                boxShadow: uploading ? "none" : "0 2px 10px #00b89422",
              }}
              aria-label={LABELS.upload}
            >
              {uploading ? LABELS.uploading : LABELS.upload}
            </button>
            <span style={{ fontSize: 15, color: "#888", marginLeft: 12 }}>
              {filtered.length}
              {LABELS.items}
            </span>
          </div>

          {/* メディアグリッド */}
          <div
            className="media-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 18,
              width: "100%",
            }}
          >
            {filtered.map(item => (
              <div
                key={item.id}
                style={{
                  background: "#fff",
                  borderRadius: 11,
                  boxShadow: "0 2px 14px #2221bb0d",
                  padding: 11,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{ width: "100%", cursor: "pointer" }}
                  onClick={() => openPreview(item)}
                  aria-label={LABELS.preview}
                >
                  {item.type === "image" ? (
                    <Image
                      src={item.url}
                      alt={item.name}
                      width={320}
                      height={180}
                      style={{
                        maxWidth: "100%",
                        borderRadius: 8,
                        objectFit: "cover",
                        marginBottom: 9,
                      }}
                    />
                  ) : (
                    <video
                      src={item.thumbnailUrl || item.url}
                      poster={item.thumbnailUrl}
                      controls
                      style={{
                        width: "100%",
                        minHeight: 110,
                        borderRadius: 8,
                        background: "#000",
                        marginBottom: 8,
                      }}
                    />
                  )}
                </div>

                {editId === item.id ? (
                  <div style={{ width: "100%", marginBottom: 7 }}>
                    <input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      style={{
                        width: "100%",
                        padding: 6,
                        borderRadius: 7,
                        border: "1.2px solid #d7e2ed",
                        fontSize: 15,
                        color: "#223366",
                        fontWeight: 800,
                      }}
                      aria-label="タイトル編集"
                    />
                    <input
                      value={editTags}
                      onChange={e => setEditTags(e.target.value)}
                      placeholder="タグ(半角スペース区切り)"
                      style={{
                        width: "100%",
                        marginTop: 6,
                        padding: 5,
                        borderRadius: 7,
                        border: "1px solid #eaeaea",
                        fontSize: 14,
                        color: "#223366",
                      }}
                      aria-label="タグ編集"
                    />
                    <div style={{ display: "flex", gap: 7, marginTop: 7 }}>
                      <button
                        type="button"
                        onClick={() => saveEdit(item.id)}
                        style={{
                          background: "#5b8dee",
                          color: "#fff",
                          border: "none",
                          padding: "6px 15px",
                          borderRadius: 7,
                          fontSize: 14,
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                        aria-label={LABELS.save}
                      >
                        {LABELS.save}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditId(null)}
                        style={{
                          background: "#eee",
                          color: "#223366",
                          border: "none",
                          padding: "6px 15px",
                          borderRadius: 7,
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                        aria-label={LABELS.cancel}
                      >
                        {LABELS.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        fontWeight: 900,
                        color: "#223366",
                        fontSize: 15,
                        marginBottom: 4,
                        width: "100%",
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                        marginBottom: 5,
                        width: "100%",
                      }}
                    >
                      {(item.tags || []).map((tag, i) => (
                        <span
                          key={`tagval-${tag}-${i}`}
                          style={{
                            background: TAG_COLORS[i % TAG_COLORS.length],
                            color: "#fff",
                            borderRadius: 7,
                            padding: "2px 9px",
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    width: "100%",
                    marginTop: 1,
                    justifyContent: "flex-end",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleCopy(item.url)}
                    style={{
                      background: "#e3eaf6",
                      color: "#223366",
                      border: "none",
                      borderRadius: 7,
                      padding: "6px 13px",
                      fontSize: 13,
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                    aria-label={LABELS.urlCopied}
                  >
                    URLコピー
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    style={{
                      background: "#f6e58d",
                      color: "#223366",
                      border: "none",
                      borderRadius: 7,
                      padding: "6px 13px",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                    aria-label={LABELS.edit}
                  >
                    {LABELS.edit}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    style={{
                      background: "#ffeaea",
                      color: "#c00",
                      border: "none",
                      borderRadius: 7,
                      padding: "6px 13px",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                    aria-label={LABELS.delete}
                  >
                    {LABELS.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* プレビュー */}
        {previewUrl && (
          <div
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: "100vw",
              height: "100vh",
              background: "#0008",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
            onClick={() => {
              setPreviewUrl(null);
              setPreviewType(null);
            }}
            aria-label={LABELS.preview}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 28,
                maxWidth: "96vw",
                maxHeight: "92vh",
              }}
            >
              {previewType === "video" ? (
                <video
                  src={previewUrl!}
                  controls
                  style={{ maxWidth: 600, maxHeight: 380, background: "#000" }}
                />
              ) : (
                <Image
                  src={previewUrl!}
                  alt="media"
                  width={500}
                  height={360}
                  style={{
                    maxWidth: 500,
                    maxHeight: 360,
                    borderRadius: 12,
                    objectFit: "contain",
                    border: "1px solid #ddd",
                  }}
                />
              )}
            </div>
          </div>
        )}

        <div style={{ height: 24, width: "100%" }} />

        <style>{`
          @media (max-width: 800px) {
            aside { min-width: 0 !important; max-width: 100vw !重要; border: none !重要; border-radius: 0 !重要;}
            div[style*="display: flex"][style*="gap: 22px"] { flex-direction: column !重要; }
            .media-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !重要; }
          }
        `}</style>
      </div>
    </>
  );
}

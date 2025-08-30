// C:\Users\ik391\room-ikejirisensei\src\app\dashboard\posts\[id]\edit\page.tsx
"use client";

import Head from "next/head";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import ArticleEditor from "@/components/dashboard/MainEditorPage";
import toast, { Toaster } from "react-hot-toast"; // Toaster あり

type Status = "draft" | "published";

export default function EditArticlePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState<string[]>([]);
  const [highlight, setHighlight] = useState(false);
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<Status>("draft");

  // 二重保存ガード
  const [savingDraft, setSavingDraft] = useState(false);
  const [savingPublish, setSavingPublish] = useState(false);

  // 初期読込
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ref = doc(db, "posts", String(id));
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          toast.error("記事が見つかりません");
          router.replace("/dashboard/posts-list");
          return;
        }
        const data = snap.data();
        if (!mounted) return;

        setTitle(data.title || "");
        setBody(data.richtext || "");
        setTags(Array.isArray(data.tags) ? data.tags : []);
        setCategory(
          Array.isArray(data.category) ? data.category : [data.category].filter(Boolean)
        );
        setHighlight(!!data.highlight);
        setSlug(data.slug || "");
        setStatus((data.status as Status) || "draft");
      } catch (e) {
        console.error(e);
        toast.error("読み込みに失敗しました");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id, router]);

  // 下書き保存（AutoSave/保存ボタン用）
  const handleDraftSave = useCallback(
    async (opts?: { source?: "manual" | "auto" }) => {
      if (savingDraft) return;
      setSavingDraft(true);
      try {
        await updateDoc(doc(db, "posts", String(id)), {
          title,
          richtext: body,
          tags,
          category,
          highlight,
          slug,
          status: "draft",
          updatedAt: serverTimestamp(),
        });
        // 手動のみ「下書きを保存しました」、自動は「Autosave」
        if (opts?.source === "manual") {
          toast.success("下書きを保存しました");
        } else {
          toast("Autosave");
        }
        setStatus("draft");
      } catch (e) {
        console.error(e);
        toast.error("下書き保存に失敗しました");
      } finally {
        setSavingDraft(false);
      }
    },
    [savingDraft, id, title, body, tags, category, highlight, slug]
  );

  // 公開（更新）
  const handlePublish = useCallback(async () => {
    if (savingPublish) return;
    setSavingPublish(true);
    try {
      await updateDoc(doc(db, "posts", String(id)), {
        title,
        richtext: body,
        tags,
        category,
        highlight,
        slug,
        status: "published",
        updatedAt: serverTimestamp(),
      });
      toast.success("記事を更新しました");
      setStatus("published");
      router.push("/dashboard/posts-list");
    } catch (e) {
      console.error(e);
      toast.error("保存エラー");
    } finally {
      setSavingPublish(false);
    }
  }, [savingPublish, id, title, body, tags, category, highlight, slug, router]);

  if (loading) {
    return (
      <>
        <Head>
          <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
          <title>記事編集 | ダッシュボード</title>
        </Head>
        <Toaster position="top-right" />
        <div>読込中...</div>
      </>
    );
  }

  const draftMode = status === "draft"; // draft のときだけ AutoSave/下書き保存を有効

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <title>記事編集 | ダッシュボード</title>
      </Head>
      <Toaster position="top-right" />
      <ArticleEditor
        title={title}
        setTitle={setTitle}
        slug={slug}
        setSlug={setSlug}
        body={body}
        setBody={setBody}
        tags={tags}
        setTags={setTags}
        category={category}
        setCategory={setCategory}
        highlight={highlight}
        setHighlight={setHighlight}
        isEditMode
        onSave={handlePublish}
        // MainEditorPage 側は manual/auto を渡す実装になっている前提
        onDraftSave={draftMode ? handleDraftSave : undefined}
      />
    </>
  );
}

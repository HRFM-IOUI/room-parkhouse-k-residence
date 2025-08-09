"use client";

import Head from "next/head";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import ArticleEditor from "@/components/dashboard/MainEditorPage";
import toast from "react-hot-toast";

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

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, "posts", String(id)));
        if (!snap.exists()) {
          toast.error("記事が見つかりません");
          router.replace("/dashboard/posts-list");
          return;
        }
        const data = snap.data();
        setTitle(data.title || "");
        setBody(data.richtext || "");
        setTags(data.tags || []);
        setCategory(Array.isArray(data.category) ? data.category : [data.category].filter(Boolean));
        setHighlight(!!data.highlight);
        setSlug(data.slug || "");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, router]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "posts", String(id)), {
        title,
        richtext: body,
        tags,
        category,
        highlight,
        slug,
        updatedAt: new Date(),
      });
      toast.success("記事を更新しました");
      router.push("/dashboard/posts-list");
    } catch {
      toast.error("保存エラー");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <>
        <Head>
          <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
          <title>記事編集 | ダッシュボード</title>
        </Head>
        <div>読込中...</div>
      </>
    );

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <title>記事編集 | ダッシュボード</title>
      </Head>
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
        onSave={handleSave}
      />
    </>
  );
}

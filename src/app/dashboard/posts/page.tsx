"use client";
import Head from "next/head";
import React, { useState } from "react";
import MainEditorPage from "@/components/dashboard/MainEditorPage";
import { db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function PostPage() {
  const [title, setTitle] = useState("");
  const [richtext, setRichtext] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState<string[]>([]);
  const [highlight, setHighlight] = useState<boolean>(false);
  const [slug, setSlug] = useState(""); // 必要なら追加

  const router = useRouter();

  const handleSave = async () => {
    try {
      await addDoc(collection(db, "posts"), {
        title,
        richtext,
        tags,
        category,
        highlight,
        slug,
        createdAt: serverTimestamp(),
        status: "published"
      });
      router.push("/dashboard/posts-list");
    } catch (e) {
      alert("保存に失敗しました：" + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <title>新規記事作成 | ダッシュボード</title>
      </Head>
      <MainEditorPage
        title={title}
        setTitle={setTitle}
        slug={slug}
        setSlug={setSlug}
        body={richtext}
        setBody={setRichtext}
        tags={tags}
        setTags={setTags}
        category={category}
        setCategory={setCategory}
        highlight={highlight}
        setHighlight={setHighlight}
        onSave={handleSave}
        isEditMode={false}
      />
    </>
  );
}

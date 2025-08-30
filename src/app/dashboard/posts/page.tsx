"use client";

import Head from "next/head";
import React, { useState, useCallback } from "react";
import MainEditorPage from "@/components/dashboard/MainEditorPage";
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  limit,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast"; // Toaster と toast

export default function PostPage() {
  const [title, setTitle] = useState("");
  const [richtext, setRichtext] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState<string[]>([]);
  const [highlight, setHighlight] = useState<boolean>(false);
  const [slug, setSlug] = useState(""); // 重複判定のキーに使う
  const [saving, setSaving] = useState(false); // 多重保存ガード
  const [draftId, setDraftId] = useState<string | null>(null); // 作成済みドラフトID保持

  const router = useRouter();

  /** 下書き保存（初回は addDoc、以降は updateDoc。slug があれば既存ドラフトも再利用）
   *  MainEditorPage 側から { source: "manual" | "auto" } が渡ってくる想定
   */
  const handleDraftSave = useCallback(
    async (opts?: { source?: "manual" | "auto" }) => {
      if (saving) return; // 連打対策
      setSaving(true);
      try {
        // 1) 既に自分が作ったドラフトがある → 更新
        if (draftId) {
          await updateDoc(doc(db, "posts", draftId), {
            title,
            richtext,
            tags,
            category,
            highlight,
            slug, // draft 中は未確定でもOK
            status: "draft",
            updatedAt: serverTimestamp(),
          });
          if (opts?.source === "manual") toast.success("下書きを保存しました");
          else toast("autosave");
          return;
        }

        // 2) 自分のdraftIdは無いが、slug指定がある → 同一slugの既存ドラフトを更新して採用
        if (slug) {
          const q = query(
            collection(db, "posts"),
            where("slug", "==", slug),
            where("status", "==", "draft"),
            limit(1)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const id = snap.docs[0].id;
            await updateDoc(doc(db, "posts", id), {
              title,
              richtext,
              tags,
              category,
              highlight,
              slug,
              status: "draft",
              updatedAt: serverTimestamp(),
            });
            setDraftId(id);
            if (opts?.source === "manual") toast.success("下書きを保存しました");
            else toast("autosave");
            return;
          }
        }

        // 3) どれにも該当しない → 新規ドラフト作成
        const ref = await addDoc(collection(db, "posts"), {
          title,
          richtext,
          tags,
          category,
          highlight,
          slug,
          status: "draft",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setDraftId(ref.id);
        if (opts?.source === "manual") toast.success("下書きを保存しました");
        else toast("autosave");
      } catch (e) {
        alert("下書き保存に失敗しました：" + (e instanceof Error ? e.message : String(e)));
      } finally {
        setSaving(false);
      }
    },
    [saving, draftId, title, richtext, tags, category, highlight, slug]
  );

  /** 公開保存（同一slugのドラフトがあれば昇格、無ければ新規published） */
  const handleSave = useCallback(async () => {
    if (saving) return; // 連打対策
    setSaving(true);
    try {
      // 1) 自分のドラフトがあれば昇格
      if (draftId) {
        await updateDoc(doc(db, "posts", draftId), {
          title,
          richtext,
          tags,
          category,
          highlight,
          slug,
          status: "published", // 昇格
          updatedAt: serverTimestamp(),
        });
        router.push("/dashboard/posts-list");
        return;
      }

      // 2) slug が一致する既存ドラフトがあれば昇格
      if (slug) {
        const q = query(
          collection(db, "posts"),
          where("slug", "==", slug),
          where("status", "==", "draft"),
          limit(1)
        );
        const snap = await getDocs(q);

        if (!snap.empty) {
          const draft = snap.docs[0];
          await updateDoc(doc(db, "posts", draft.id), {
            title,
            richtext,
            tags,
            category,
            highlight,
            slug,
            status: "published", // 昇格
            updatedAt: serverTimestamp(),
          });
          router.push("/dashboard/posts-list");
          return;
        }
      }

      // 3) 下書きが無ければ新規作成（published）
      await addDoc(collection(db, "posts"), {
        title,
        richtext,
        tags,
        category,
        highlight,
        slug,
        status: "published",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push("/dashboard/posts-list");
    } catch (e) {
      alert("保存に失敗しました：" + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  }, [saving, draftId, title, richtext, tags, category, highlight, slug, router]);

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <title>新規記事作成 | ダッシュボード</title>
      </Head>

      {/* Toaster をこのページにマウント（グローバルで入れてない場合でも確実に表示） */}
      <Toaster position="top-right" />

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
        onSave={handleSave}             // 公開保存
        onDraftSave={handleDraftSave}   // 下書き保存/オートセーブ（manual/auto 区別）
        isEditMode={false}
      />

      {/* （任意）保存中の薄いオーバーレイ */}
      {saving && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255,255,255,0.35)",
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );
}
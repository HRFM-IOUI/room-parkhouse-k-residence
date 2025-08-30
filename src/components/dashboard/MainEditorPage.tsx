// C:\Users\ik391\room-ikejirisensei\src\components\dashboard\MainEditorPage.tsx 
"use client";

import NextImage from "next/image";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
const TopHistoryBar = dynamic(() => import("@/components/dashboard/TopHistoryBar"), { ssr: false });

import EditorTitleSlug from "@/components/dashboard/EditorTitleSlug";
import ABXYPad, { StartButton } from "@/components/dashboard/ABXYPad";
import StartMenuModal from "@/components/dashboard/StartMenuModal";
import ABXYDrawerModal from "@/components/dashboard/ABXYDrawerModal";
import PCABXYCorners from "@/components/dashboard/PCABXYCorners";
import TextStyleDrawer from "@/components/dashboard/TextStyleDrawer";
import MediaEmbedDrawer from "@/components/dashboard/MediaEmbedDrawer";
import ParagraphStructureDrawer from "@/components/dashboard/StructureDrawer";
import LinkEtcDrawer from "@/components/dashboard/LinkEtcDrawer";

// TipTap関連
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import FontSize from "@/tiptap/extensions/FontSize";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";
import type { ChainedCommands } from "@tiptap/core";

import toast from "react-hot-toast";

type Props = {
  postId?: string;
  title: string;
  setTitle: (v: string) => void;
  slug: string;
  setSlug: (v: string) => void;
  body: string;
  setBody: (v: string) => void;
  category: string[];
  setCategory: (v: string[]) => void;
  tags: string[];
  setTags: (v: string[]) => void;
  eyecatch?: string;
  setEyecatch?: (v: string) => void;
  isEditMode?: boolean;
  highlight?: boolean;
  setHighlight?: (v: boolean) => void;

  /** 親がDB保存を行うハンドラ（公開保存） */
  onSave?: () => Promise<void>;
  /** 親がドラフト保存（または自動保存）を行うハンドラ */
  // ▼ 変更：呼び出し元に「manual/auto」を伝える
  onDraftSave?: (opts?: { source?: "manual" | "auto" }) => Promise<void>;
};

export default function MainEditorPage(props: Props) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // 二重押下ガード（UI側）
  const [saving, setSaving] = useState(false);
  const [draftSaving, setDraftSaving] = useState(false);

  // 選択レンジ保持
  const lastSelRef = useRef<{ from: number; to: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    setIsMobile(typeof window !== "undefined" && /iPhone|Android|iPad/i.test(navigator.userAgent));
  }, []);

  const [preview, setPreview] = useState(false);
  const [openDrawer, setOpenDrawer] = useState<"A" | "B" | "X" | "Y" | null>(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [fontSize, setFontSize] = useState("16px");
  const [fontFamily, setFontFamily] = useState("system-ui, sans-serif");

  // アイキャッチ自動抽出（YouTubeは img.youtube.com に変換）
  function youtubeIdFromUrl(url: string) {
    const m = url.match(/(?:youtube\.com\/(?:embed|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return m?.[1] ?? null;
  }
  function extractThumbnailFromHTML(html: string): string | null {
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) return imgMatch[1];
    const ytMatch = html.match(/<iframe[^>]+src=["']([^"']+youtube\.com[^"']+)["']/i);
    if (ytMatch) {
      const id = youtubeIdFromUrl(ytMatch[1]);
      if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
    const videoMatch = html.match(/<video[^>]+src=["']([^"']+)["']/i);
    if (videoMatch) return "/video-thumb.jpg";
    return null;
  }
  const firstImage = extractThumbnailFromHTML(props.body) || "";
  const showEyecatch = props.eyecatch || firstImage || "/eyecatch.jpg";

  // 本文同期はデバウンスして負荷軽減
  const setBodyFn = props.setBody;
  const setBodyDebounced = useMemo(() => {
    let t: ReturnType<typeof setTimeout> | null = null;
    return (html: string) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => setBodyFn(html), 150);
    };
  }, [setBodyFn]);

  // TipTapエディタ
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ underline: false, link: false }),
      TextStyle,
      FontSize,
      Color,
      FontFamily,
      Underline,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, autolink: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Youtube,
    ],
    content: props.body || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "outline-none w-full min-h-[350px] sm:min-h-[500px] max-w-2xl rounded-xl border p-4 sm:p-6 text-base bg-white text-gray-900 shadow tiptap ProseMirror",
      },
    },
    onUpdate: ({ editor }) => {
      setBodyDebounced(editor.getHTML());
      const attrs = editor.getAttributes("textStyle") || {};
      if (attrs.fontSize) setFontSize(attrs.fontSize);
      if (attrs.fontFamily) setFontFamily(attrs.fontFamily);
    },
    onSelectionUpdate: ({ editor }) => {
      const sel = editor.state.selection;
      lastSelRef.current = { from: sel.from, to: sel.to };
    },
    autofocus: true,
    editable: true,
    immediatelyRender: false,
  });

  // 外部から body が差し替わった場合（編集モード初期ロード等）に反映
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (props.body && props.body !== current) {
      editor.commands.setContent(props.body, { emitUpdate: false });
    }
  }, [editor, props.body]);

  // 選択復元→チェーン実行（型付き）
  const restoreAndRun = useCallback(
    (run: (chain: ChainedCommands) => ChainedCommands) => {
      if (!editor) return;
      let chain = editor.chain();
      if (!editor.isFocused) chain = chain.focus();
      const sel = lastSelRef.current;
      if (sel && sel.from !== sel.to) chain = chain.setTextSelection(sel);
      run(chain).run();
    },
    [editor]
  );

  // コマンド系
  const handleBold = useCallback(() => editor?.chain().focus().toggleBold().run(), [editor]);
  const handleItalic = useCallback(() => editor?.chain().focus().toggleItalic().run(), [editor]);
  const handleUnderline = useCallback(() => editor?.chain().focus().toggleUnderline().run(), [editor]);
  const handleStrike = useCallback(() => editor?.chain().focus().toggleStrike().run(), [editor]);
  const handleHighlight = useCallback(() => editor?.chain().focus().setHighlight().run(), [editor]);
  const handleColorChange = useCallback((color: string) => editor?.chain().focus().setColor(color).run(), [editor]);
  const handleHighlightColorChange = useCallback((color: string) => editor?.chain().focus().setHighlight({ color }).run(), [editor]);

  // ★ 選択復元してから適用
  const handleFontSizeChange = useCallback(
    (size: string) => {
      setFontSize(size);
      restoreAndRun((chain) => chain.setMark("textStyle", { fontSize: size }));
    },
    [restoreAndRun]
  );
  const handleFontFamilyChange = useCallback(
    (family: string) => {
      setFontFamily(family);
      restoreAndRun((chain) => chain.setMark("textStyle", { fontFamily: family }));
    },
    [restoreAndRun]
  );

  const handleImage = useCallback(() => {
    const url = window.prompt("画像URLを入力:");
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  }, [editor]);
  const handleYoutube = useCallback(() => {
    const url = window.prompt("YouTube動画URLを入力:");
    if (url) editor?.chain().focus().setYoutubeVideo({ src: url }).run();
  }, [editor]);
  const handleX = useCallback(() => {
    const url = window.prompt("X(Twitter)埋め込みURL（ツイートiframe）を入力:");
    if (url) {
      const html = `<blockquote class="twitter-tweet"><a href="${url}"></a></blockquote>`;
      editor?.chain().focus().insertContent(html).run();
    }
  }, [editor]);
  const handleGoogleMap = useCallback(() => {
    const url = window.prompt("Googleマップのiframe埋め込みURLを入力:");
    if (url) {
      const html = `<iframe src="${url}" width="300" height="200" style="border:0;" allowFullScreen="" loading="lazy"></iframe>`;
      editor?.chain().focus().insertContent(html).run();
    }
  }, [editor]);
  const handleTable = useCallback(() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), [editor]);
  const handleHeading = useCallback((level: 1 | 2 | 3) => editor?.chain().focus().toggleHeading({ level }).run(), [editor]);
  const handleBulletList = useCallback(() => editor?.chain().focus().toggleBulletList().run(), [editor]);
  const handleOrderedList = useCallback(() => editor?.chain().focus().toggleOrderedList().run(), [editor]);
  const handleTaskList = useCallback(() => editor?.chain().focus().toggleTaskList().run(), [editor]);
  const handleAlign = useCallback((type: "left" | "center" | "right" | "justify") => editor?.chain().focus().setTextAlign(type).run(), [editor]);
  const handleBlockquote = useCallback(() => editor?.chain().focus().toggleBlockquote().run(), [editor]);
  const handleCodeBlock = useCallback(() => editor?.chain().focus().toggleCodeBlock().run(), [editor]);
  const handleInsertLink = useCallback(() => {
    const url = window.prompt("リンクURLを入力してください:");
    if (!url) return;
    const selection = editor?.state.selection;
    const empty = selection?.empty;
    if (empty) {
      const linkText = window.prompt("リンクとして表示するテキストを入力:");
      if (linkText && selection) {
        editor
          ?.chain()
          .focus()
          .insertContent(linkText)
          .setTextSelection({ from: selection.from, to: selection.from + linkText.length })
          .setLink({ href: url })
          .run();
      }
    } else {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);
  const handleUnsetLink = useCallback(() => editor?.chain().focus().unsetLink().run(), [editor]);
  const handleEditLink = useCallback(() => {
    const prevUrl = editor?.getAttributes("link").href || "";
    const url = window.prompt("リンクURLを編集", prevUrl);
    if (url === null) return;
    if (url === "") editor?.chain().focus().unsetLink().run();
    else editor?.chain().focus().setLink({ href: url }).run();
  }, [editor]);
  const onUndo = useCallback(() => editor?.chain().focus().undo().run(), [editor]);
  const onRedo = useCallback(() => editor?.chain().focus().redo().run(), [editor]);

  /** ====== 保存系（親に委譲） ====== */
  const validate = useCallback(() => {
    if (!props.title.trim()) {
      toast.error("タイトル必須！");
      return false;
    }
    if (!props.body || props.body === "<p></p>") {
      toast.error("本文空です！");
      return false;
    }
    if (props.slug && !/^[a-zA-Z0-9_-]+$/.test(props.slug)) {
      toast.error("スラッグ不正");
      return false;
    }
    return true;
  }, [props.title, props.body, props.slug]);

  const handleSave = useCallback(async () => {
    const onSave = props.onSave; // ★ ローカル退避でnarrowing維持
    if (!onSave) {
      toast.error("保存ハンドラが未接続です（onSave）");
      return;
    }
    if (saving) return;
    if (!validate()) return;

    setSaving(true);
    try {
      await onSave();
    } catch (e) {
      toast.error("保存エラー: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  }, [props.onSave, saving, validate]);

  const handleSaveDraft = useCallback(async () => {
    const onDraftSave = props.onDraftSave; // ★ ローカル退避でnarrowing維持
    if (!onDraftSave) {
      toast("下書き保存：ハンドラ未接続", { icon: "ℹ️" });
      return;
    }
    if (draftSaving) return;

    setDraftSaving(true);
    try {
      // ★ 手動保存は manual として親に通知
      await onDraftSave({ source: "manual" });
      // 成功トーストは親側で表示（manual のときだけ）
    } catch (e) {
      toast.error("下書きエラー: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setDraftSaving(false);
    }
  }, [props.onDraftSave, draftSaving]);

  /** ====== AutoSave（onDraftSave が渡されたときだけ 5秒無操作で実行） ====== */
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    setDirty(true);
  }, [props.title, props.body, props.tags, props.category, props.slug, props.highlight]);

  useEffect(() => {
    const draftSave = props.onDraftSave; // ★ ローカルに退避（TS2722回避）
    if (!draftSave) return;
    if (!dirty) return;

    const t = setTimeout(async () => {
      try {
        // ★ オートセーブは auto として親に通知（親側で "Autosave" 表示に切り替え可能）
        await draftSave({ source: "auto" });
      } catch {
        /* サイレント */
      } finally {
        setDirty(false); // 連続発火を抑制
      }
    }, 5000); // 5秒無操作で保存

    return () => clearTimeout(t);
  }, [dirty, props.onDraftSave]);

  // メディア・戻る（フルリロードを避ける）
  const handleMediaLibrary = useCallback(() => { router.push("/dashboard/media"); }, [router]);
  const handleBack = useCallback(() => { router.push("/dashboard"); }, [router]);

  const handleOpenDrawerA = useCallback(() => setOpenDrawer("A"), []);
  const handleOpenDrawerB = useCallback(() => setOpenDrawer("B"), []);
  const handleOpenDrawerX = useCallback(() => setOpenDrawer("X"), []);
  const handleOpenDrawerY = useCallback(() => setOpenDrawer("Y"), []);
  const handleStartMenu  = useCallback(() => setStartMenuOpen(true), []);

  // 初回レンダ時は何も描画しない（hydration mismatch防止）
  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#f9fafe] flex flex-col items-center px-2 py-2 relative overflow-x-hidden">
      <TopHistoryBar
        preview={preview}
        setPreview={setPreview}
        onUndo={onUndo}
        onRedo={onRedo}
        category={props.category}
        setCategory={props.setCategory}
        tags={props.tags}
        setTags={props.setTags}
      />

      <EditorTitleSlug title={props.title} setTitle={props.setTitle} slug={props.slug} setSlug={props.setSlug} />

      <div className="w-full flex flex-col items-center relative">
        {/* PC用四隅ABXYコンポーネント */}
        {!isMobile && (
          <PCABXYCorners
            fontSize={fontSize}
            fontFamily={fontFamily}
            handleBold={handleBold}
            handleItalic={handleItalic}
            handleUnderline={handleUnderline}
            handleStrike={handleStrike}
            handleHighlight={handleHighlight}
            handleColorChange={handleColorChange}
            handleHighlightColorChange={handleHighlightColorChange}
            handleFontSizeChange={handleFontSizeChange}
            handleFontFamilyChange={handleFontFamilyChange}
            handleImage={handleImage}
            handleYoutube={handleYoutube}
            handleX={handleX}
            handleGoogleMap={handleGoogleMap}
            handleTable={handleTable}
            handleHeading={handleHeading}
            handleBulletList={handleBulletList}
            handleOrderedList={handleOrderedList}
            handleTaskList={handleTaskList}
            handleAlign={handleAlign}
            handleBlockquote={handleBlockquote}
            handleCodeBlock={handleCodeBlock}
            handleInsertLink={handleInsertLink}
            handleUnsetLink={handleUnsetLink}
            handleEditLink={handleEditLink}
          />
        )}

        {/* 本文エディター */}
        {preview ? (
          <div className="w-full max-w-2xl min-h-[350px] sm:min-h-[500px] rounded-xl border bg-white shadow p-6 text-base text-gray-800 overflow-auto">
            <b>プレビュー</b>
            <div dangerouslySetInnerHTML={{ __html: props.body }} />
          </div>
        ) : editor ? (
          <div className="w-full max-w-2xl min-h-[350px] sm:min-h-[500px] rounded-xl bg-white shadow-lg p-4 sm:p-6 flex">
            <EditorContent
              className="w-full tiptap ProseMirror min-h-[320px] sm:min-h-[460px] focus:outline-none text-gray-900"
              editor={editor}
            />
          </div>
        ) : null}
      </div>

      {/* アイキャッチ自動プレビュー */}
      <div className="my-4">
        <div className="text-xs text-gray-600 mb-1">サムネイル自動プレビュー</div>
        <NextImage
          src={showEyecatch}
          alt="eyecatch"
          width={170}
          height={110}
          className="max-w-[170px] max-h-[110px] rounded-lg shadow"
          style={{ objectFit: "cover" }}
          unoptimized
        />
        {!isMobile && (
          <div className="flex justify-center mt-2">
            <StartButton
              onClick={handleStartMenu}
              style={{
                position: "static",
                left: "auto",
                bottom: "auto",
                transform: "none",
                zIndex: "auto",
              }}
            />
          </div>
        )}
      </div>

      {/* スマホ用ABXYPad・Drawer */}
      {isMobile && (
        <>
          <ABXYPad
            onA={handleOpenDrawerA}
            onB={handleOpenDrawerB}
            onX={handleOpenDrawerX}
            onY={handleOpenDrawerY}
            onStart={handleStartMenu}
          />
          <ABXYDrawerModal openType={openDrawer} onClose={() => setOpenDrawer(null)}>
            {openDrawer === "A" && (
              <TextStyleDrawer
                onBold={handleBold}
                onItalic={handleItalic}
                onUnderline={handleUnderline}
                onStrike={handleStrike}
                onHighlight={handleHighlight}
                onColorChange={handleColorChange}
                onHighlightColorChange={handleHighlightColorChange}
                onFontSizeChange={handleFontSizeChange}
                onFontFamilyChange={handleFontFamilyChange}
                fontSize={fontSize}
                fontFamily={fontFamily}
              />
            )}
            {openDrawer === "B" && (
              <MediaEmbedDrawer
                onImage={handleImage}
                onYoutube={handleYoutube}
                onX={handleX}
                onGoogleMap={handleGoogleMap}
                onTable={handleTable}
              />
            )}
            {openDrawer === "X" && (
              <ParagraphStructureDrawer
                onHeading={handleHeading}
                onBulletList={handleBulletList}
                onOrderedList={handleOrderedList}
                onTaskList={handleTaskList}
                onAlign={handleAlign}
                onBlockquote={handleBlockquote}
                onCodeBlock={handleCodeBlock}
              />
            )}
            {openDrawer === "Y" && (
              <LinkEtcDrawer
                onInsertLink={handleInsertLink}
                onUnsetLink={handleUnsetLink}
                onEditLink={handleEditLink}
                onInsertYoutube={handleYoutube}
                onInsertX={handleX}
              />
            )}
          </ABXYDrawerModal>
        </>
      )}

      {/* モーダル：STARTメニュー（親に完全委譲） */}
      <StartMenuModal
        open={startMenuOpen}
        onClose={() => setStartMenuOpen(false)}
        onSave={handleSaveDraft}  // ← 親 onDraftSave に委譲（manual）
        onPost={handleSave}       // ← 親 onSave に委譲
        onMedia={handleMediaLibrary}
        onBack={handleBack}
      />

      {/* PC四隅スタイル */}
      <style>{`
        .abxy-corner { z-index: 30; }
        .abxy-corner-b { top: 18px; right: 28px; }
        .abxy-corner-a { bottom: 18px; right: 28px; }
        .abxy-corner-y { top: 18px; left: 28px; }
        .abxy-corner-x { bottom: 18px; left: 28px; }
        .abxy-drawer-btn {
          width: 38px; height: 38px; border-radius: 50%; background: #eee;
          font-weight: bold; font-size: 1.4rem; border: 2px solid #3332;
          box-shadow: 0 2px 8px #0001; margin-bottom: 8px;
        }
        .abxy-b { color: #1969ff; border-color: #1969ff33;}
        .abxy-a { color: #ff9716; border-color: #ff971633;}
        .abxy-y { color: #ffd700; border-color: #ffd70033;}
        .abxy-x { color: #48b7a7; border-color: #48b7a733;}
        .drawer-content {
          min-width: 220px;
          max-width: 320px;
          background: #fff;
          border-radius: 15px;
          box-shadow: 0 4px 24px #0003;
          padding: 14px 14px 10px 14px;
          margin-bottom: 10px;
        }
        @media (max-width: 800px) {
          .abxy-corner { display: none; }
        }
        .tiptap, .ProseMirror {
          min-height: 320px;
          height: auto;
          overflow: visible;
          color: #111827; /* 強制黒文字 */
        }
        .tiptap:focus, .ProseMirror:focus {
          outline: 2px solid #3b82f6;
          box-shadow: 0 0 0 3px #3b82f631;
        }
      `}</style>

      {/* 保存中オーバーレイ（任意） */}
      {(saving || draftSaving) && (
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
    </main>
  );
}

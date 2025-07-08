"use client";
import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Block } from "./dashboardConstants";
import SortableBlock from "./SortableBlock";

// カテゴリ一覧
const CATEGORY_LIST = [
  "管理組合",
  "理事会",
  "検討委員会",
  "防災",
  "地域情報",
  "管理室より",
  "ペット",
  "季節イベント",
  "環境美化",
  "今期理事",
  "その他",
];
// スマホ判定
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
}

type SupportedLang = "ja" | "en" | "tr" | "zh" | "ko" | "ru" | "ar";

type Props = {
  title: string;
  setTitle: (v: string) => void;
  blocks: Block[];
  isEditMode?: boolean;
  onSave: (
    title: string,
    blocks: Block[],
    tags?: string[],
    category?: string,
    highlight?: boolean
  ) => Promise<void> | void;
  tags?: string[];
  setTags?: (tags: string[]) => void;
  category?: string;
  setCategory?: (category: string) => void;
  highlight?: boolean;
  setHighlight?: (highlight: boolean) => void;
  onBlockSelect?: (id: string | null) => void;
  onFullscreenEdit?: (blockId: string, language: SupportedLang) => void;
  fullscreenLanguage?: SupportedLang;
  onAddBlock: (type: Block["type"]) => void;
  onDeleteBlock: (id: string) => void;
  onBlockChange: (id: string, value: string) => void;
  onSortBlocks: (activeId: string, overId: string) => void;
};

export default function ArticleEditor({
  title,
  setTitle,
  blocks,
  isEditMode = false,
  onSave,
  tags = [],
  setTags,
  category = "",
  setCategory,
  highlight = false,
  setHighlight,
  onBlockSelect,
  onFullscreenEdit,
  fullscreenLanguage = "ja",
  onAddBlock,
  onDeleteBlock,
  onBlockChange,
  onSortBlocks,
}: Props) {
  const [tagInput, setTagInput] = React.useState("");
  const [blockLanguage, setBlockLanguage] = React.useState<SupportedLang>(fullscreenLanguage);
  const [autoTitleActive, setAutoTitleActive] = React.useState(true);
  const isMobile = useIsMobile();

  // D&Dセンサー
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // 並び替えイベント
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active?.id && over?.id && active.id !== over.id) {
      onSortBlocks(String(active.id), String(over.id));
    }
  };

  // タグ追加/削除
  const handleAddTag = () => {
    const val = tagInput.trim();
    if (val && !tags.includes(val) && val.length <= 20) {
      setTags?.([...tags, val]);
      setTagInput("");
    } else if (val.length > 20) {
      alert("Tag must be 20 characters or less.");
    }
  };
  const handleDeleteTag = (tag: string) => {
    setTags?.(tags.filter((t) => t !== tag));
  };

  // タイトル自動生成
  React.useEffect(() => {
    if (!autoTitleActive || title.trim()) return;
    const firstContent = blocks.find((b) => b.content?.trim())?.content?.trim();
    if (firstContent) {
      let autoTitle = firstContent.split(/[\n。.!?]/)[0].slice(0, 30);
      if (autoTitle.length < firstContent.length) autoTitle += "…";
      setTitle(`(auto: ${autoTitle})`);
    }
  }, [blocks, autoTitleActive, title, setTitle]);

  // 手動タイトル入力で自動生成解除
  const handleTitleChange = (v: string) => {
    setTitle(v);
    setAutoTitleActive(false);
  };

  // 記事保存
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.startsWith("(auto: ")) {
      alert("Please enter a title.");
      return;
    }
    if (title.length > 120) {
      alert("Title must be 120 characters or less.");
      return;
    }
    if (
      !blocks.length ||
      blocks.every((b) => {
        if (b.type === "heading" || b.type === "text") {
          return !b.content.trim();
        }
        if (b.type === "image" || b.type === "video") {
          return !b.content;
        }
        return true;
      })
    ) {
      alert("Content is empty.");
      return;
    }
    onSave(title.trim(), blocks, tags, category, highlight);
  };

  // 言語選択肢
  const languageOptions = [
    { label: "日本語", value: "ja" },
    { label: "English", value: "en" },
    { label: "Türkçe", value: "tr" },
    { label: "中文", value: "zh" },
    { label: "한국어", value: "ko" },
    { label: "Русский", value: "ru" },
    { label: "العربية", value: "ar" },
  ];

  return (
    <form
      onSubmit={handleSave}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? 10 : 22,
        width: "100%",
        background: "#ffffff",
        borderRadius: isMobile ? 0 : 12,
        boxShadow: isEditMode && !isMobile ? "0 3px 18px #19234920" : undefined,
        padding: isEditMode
          ? isMobile
            ? "2px 0 0 0"
            : "18px 16px"
          : isMobile
            ? "2px 0 0 0"
            : "12px 0",
        minHeight: 0,
        margin: 0,
        height: "auto",
      }}
      aria-label={isEditMode ? "Edit article" : "New article"}
    >
      <h3
        style={{
          fontWeight: 800,
          fontSize: isMobile ? 15 : 18,
          color: "#192349",
          marginBottom: 4,
          letterSpacing: 0.5,
        }}
      >
        {isEditMode ? "Edit article" : "New article"}
      </h3>
      {/* タイトル入力 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 6 }}>
        <label
          htmlFor="title-input"
          style={{
            fontWeight: 700,
            color: "#192349",
            marginBottom: 1,
            fontSize: isMobile ? 13 : 15,
          }}
        >
          Title <span style={{ color: "#e36", fontSize: 12, fontWeight: 500 }}>*required</span>
        </label>
        <input
          id="title-input"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Enter article title (up to 120 chars)"
          maxLength={120}
          style={{
            width: "100%",
            padding: isMobile ? "5px 7px" : "8px 14px",
            borderRadius: 7,
            border: "1.5px solid #ccd5f2",
            fontSize: isMobile ? 14 : 17,
            fontWeight: 700,
            color: "#192349",
          }}
          aria-label="Article title"
          required
        />
        {autoTitleActive && (
          <span
            style={{
              color: "#5b8dee",
              fontSize: isMobile ? 11 : 13,
              fontWeight: 500,
              cursor: "pointer",
              marginTop: 2,
              alignSelf: "flex-start",
            }}
            onClick={() => setAutoTitleActive(false)}
            role="button"
            tabIndex={0}
          >
            Title is auto-generated from content / Click to edit manually
          </span>
        )}
      </div>

      {/* カテゴリ選択 */}
      <div
        style={{
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <label
          htmlFor="category-select"
          style={{
            fontWeight: 700,
            color: "#192349",
            fontSize: isMobile ? 13 : 15,
          }}
        >
          Category:
        </label>
        <select
          id="category-select"
          value={category || ""}
          onChange={(e) => setCategory?.(e.target.value)}
          style={{
            fontWeight: 700,
            borderRadius: 7,
            border: "1.2px solid #e0e4ef",
            padding: isMobile ? "4px 8px" : "6px 13px",
            fontSize: isMobile ? 13 : 15,
            minWidth: 160,
            color: "#192349",
            background: "#fff",
          }}
        >
          <option value="">Select a category</option>
          {CATEGORY_LIST.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* ハイライト指定 */}
      <div
        style={{
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <input
          id="highlight-checkbox"
          type="checkbox"
          checked={!!highlight}
          onChange={(e) => setHighlight?.(e.target.checked)}
          style={{
            width: 18,
            height: 18,
            accentColor: "#5b8dee",
            marginRight: 6,
          }}
        />
        <label
          htmlFor="highlight-checkbox"
          style={{
            fontWeight: 700,
            color: "#192349",
            fontSize: isMobile ? 13 : 15,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          Show in "Highlight" carousel (top)
        </label>
      </div>

      {/* タグ編集 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: 4,
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            color: "#192349",
            marginRight: 4,
            fontSize: isMobile ? 12 : 14,
          }}
        >
          Tags:
        </span>
        {tags.map((tag, i) => (
          <span
            key={`${tag}_${i}`}
            style={{
              background: "#e3e8fc",
              color: "#192349",
              borderRadius: 8,
              padding: "1.5px 10px",
              fontWeight: 700,
              fontSize: isMobile ? 11 : 13,
              marginRight: 3,
              marginBottom: 2,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {tag}
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                color: "#888",
                marginLeft: 2,
                cursor: "pointer",
                fontSize: isMobile ? 12 : 14,
                fontWeight: 700,
                padding: 0,
              }}
              onClick={() => handleDeleteTag(tag)}
              aria-label={`Remove tag ${tag}`}
              tabIndex={0}
            >
              ×
            </button>
          </span>
        ))}
        <div
          style={{
            display: "flex",
            gap: 2,
            width: isMobile ? "100%" : undefined,
          }}
        >
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tag"
            style={{
              padding: isMobile ? "3px 5px" : "5px 10px",
              borderRadius: 6,
              border: "1px solid #ccd5f2",
              fontSize: isMobile ? 12 : 14,
              minWidth: 60,
              flex: 1,
            }}
            maxLength={20}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
            aria-label="Add new tag"
          />
          <button
            type="button"
            onClick={handleAddTag}
            style={{
              background: "#5b8dee",
              color: "#ffffff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: isMobile ? 12 : 14,
              padding: isMobile ? "4px 7px" : "6px 15px",
              marginLeft: 2,
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* 言語選択 */}
      {onFullscreenEdit && (
        <div style={{ marginBottom: 5, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700, color: "#192349", fontSize: isMobile ? 12 : 14 }}>
            Sheet Language:
          </span>
          <select
            value={blockLanguage}
            onChange={(e) => setBlockLanguage(e.target.value as SupportedLang)}
            style={{
              fontWeight: 700,
              borderRadius: 7,
              border: "1.2px solid #e0e4ef",
              padding: isMobile ? "4px 8px" : "6px 13px",
              fontSize: isMobile ? 12 : 15,
            }}
            aria-label="Sheet Language"
          >
            {languageOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* D&Dブロックリスト */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 5 : 13 }}>
            {blocks.map((block, idx) => (
              <SortableBlock
                key={`${block.id}_${idx}`}
                block={block}
                index={idx}
                onSelect={() => onBlockSelect?.(block.id)}
                onFullscreenEdit={
                  onFullscreenEdit
                    ? (blockId: string) => onFullscreenEdit(blockId, blockLanguage)
                    : undefined
                }
                language={blockLanguage}
                onChange={onBlockChange}
                onDelete={onDeleteBlock}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {/* PC/タブレット時のみ下ボタン。スマホは追尾フッターに集約 */}
      {!isMobile && (
        <>
          <div>
            <button
              type="button"
              onClick={() => onAddBlock("text")}
              style={{
                background: "#e3e8fc",
                color: "#192349",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 15,
                padding: "7px 22px",
                marginTop: 5,
                cursor: "pointer",
              }}
            >
              ＋ Add paragraph
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              type="submit"
              style={{
                background: "#5b8dee",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 17,
                padding: "11px 30px",
                cursor: "pointer",
              }}
            >
              {isEditMode ? "Save" : "Publish"}
            </button>
          </div>
        </>
      )}
    </form>
  );
}

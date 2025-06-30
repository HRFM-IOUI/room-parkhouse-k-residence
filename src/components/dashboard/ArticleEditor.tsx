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
  "vision",
  "specs",
  "announcement",
  "usecase",
  "research",
  "culture",
  "technology",
  "education",
  "policy",
  "philosophy",
  "worldview",
  "uncategorized",
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
    </form>
  );
}

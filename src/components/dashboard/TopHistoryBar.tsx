"use client";

import React, { useState } from "react";
import Select from "react-select";
import { FiEye, FiEyeOff, FiRotateCcw, FiRotateCw } from "react-icons/fi";

// カテゴリ一覧
const categories = [
  "理事会", "検討委員会", "管理組合", "管理室", "暮らしと防災",
"その他"
];

// react-select用オプション
const categoryOptions = categories.map(cat => ({
  value: cat,
  label: cat
}));

type Props = {
  preview: boolean;
  setPreview: (v: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  category: string[];                // 配列で管理
  setCategory: (v: string[]) => void;
  tags: string[];
  setTags: (v: string[]) => void;
};

export default function TopHistoryBar({
  preview,
  setPreview,
  onUndo,
  onRedo,
  category,
  setCategory,
  tags,
  setTags,
}: Props) {
  const [tagInput, setTagInput] = useState("");
  const today = new Date();
  const ymd = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;

  // タグ追加
  const handleAddTag = () => {
    const val = tagInput.trim();
    if (!val || tags.includes(val) || val.length > 20) return;
    setTags([...tags, val]);
    setTagInput("");
  };
  // タグ削除
  const handleDeleteTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  return (
    <div
      className="flex items-center justify-between w-full max-w-md mx-auto mb-2 gap-2 px-2"
      style={{ height: 44 }}
    >
      <div />
      <div className="flex items-center gap-1 mx-auto">
        <button className="history-btn" onClick={onUndo} title="元に戻す"><FiRotateCcw size={21} /></button>
        <button className="history-btn" onClick={onRedo} title="やり直し"><FiRotateCw size={21} /></button>
        <button className="history-btn" onClick={() => setPreview(!preview)} title="プレビュー">
          {preview ? <FiEyeOff size={21} /> : <FiEye size={21} />}
        </button>
        <span className="ml-3 text-gray-600 font-bold text-[1.04rem]">{ymd}</span>
        {/* カテゴリ: react-select複数選択 */}
        <div className="ml-3" style={{ minWidth: 160, width: 170 }}>
          <Select
            isMulti
            options={categoryOptions}
            value={categoryOptions.filter(opt => category.includes(opt.value))}
            onChange={selected => setCategory(selected.map(opt => opt.value))}
            placeholder="カテゴリ選択"
            classNamePrefix="category-select"
            styles={{
              control: base => ({
                ...base,
                minHeight: '28px',
                fontSize: '13px',
                borderRadius: '7px',
                background: '#f6f8fd'
              }),
              multiValue: base => ({
                ...base,
                background: '#e1f0ff',
                color: '#225',
              }),
              valueContainer: base => ({
                ...base,
                padding: '0 6px',
              }),
            }}
          />
        </div>
        {/* タグ一覧 */}
        <div className="flex items-center ml-3 gap-1">
          {tags.map(tag => (
            <span
              key={tag}
              className="bg-blue-100 text-blue-800 rounded px-2 py-0.5 text-xs font-semibold flex items-center"
              style={{ marginRight: 2 }}
            >
              #{tag}
              <button
                onClick={() => handleDeleteTag(tag)}
                className="ml-1 text-red-500 font-bold"
                style={{ lineHeight: 1 }}
                title="削除"
              >×</button>
            </span>
          ))}
          {/* タグ追加 */}
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
            placeholder="タグ"
            className="border rounded px-1 text-xs"
            style={{ width: 60 }}
            maxLength={20}
          />
          <button
            onClick={handleAddTag}
            className="bg-blue-400 text-white px-2 rounded text-xs font-bold"
            style={{ marginLeft: 2 }}
          >追加</button>
        </div>
      </div>
      <div />
    </div>
  );
}

import React from "react";
import {
  FaBold, FaItalic, FaUnderline, FaStrikethrough, FaHighlighter, FaPalette, FaTextHeight, FaFillDrip, FaFont
} from "react-icons/fa";

type Props = {
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onStrike?: () => void;
  onHighlight?: () => void;
  onColorChange?: (color: string) => void;
  onHighlightColorChange?: (color: string) => void;
  onFontSizeChange?: (size: string) => void;
  onFontFamilyChange?: (family: string) => void;
  fontSize?: string;      // ★追加（親から受け取る）
  fontFamily?: string;    // ★追加（親から受け取る）
};

const FONT_SIZES = [
  { label: "小", value: "12px" },
  { label: "標準", value: "16px" },
  { label: "大", value: "20px" },
  { label: "特大", value: "28px" },
  { label: "最大", value: "36px" },
];

const FONT_FAMILIES = [
  { label: "ゴシック体", value: "system-ui, sans-serif" },
  { label: "明朝体", value: "serif" },
  { label: "メイリオ", value: "Meiryo, sans-serif" },
  { label: "游ゴシック", value: "'Yu Gothic', YuGothic, sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Times", value: "Times New Roman, Times, serif" },
  { label: "Monospace", value: "monospace" },
];

const TextStyleDrawer: React.FC<Props> = ({
  onBold, onItalic, onUnderline, onStrike, onHighlight,
  onColorChange, onHighlightColorChange, onFontSizeChange, onFontFamilyChange,
  fontSize, fontFamily,
}) => (
  <div className="text-style-drawer">
    <div className="mb-3 font-semibold">テキスト装飾</div>
    <div className="flex gap-3 flex-wrap">
      <button onClick={onBold} className="drawer-btn"><FaBold /> 太字</button>
      <button onClick={onItalic} className="drawer-btn"><FaItalic /> 斜体</button>
      <button onClick={onUnderline} className="drawer-btn"><FaUnderline /> 下線</button>
      <button onClick={onStrike} className="drawer-btn"><FaStrikethrough /> 取り消し</button>
      <button onClick={onHighlight} className="drawer-btn"><FaHighlighter /> ハイライト</button>
      {/* --- 文字色ピッカー --- */}
      <label className="drawer-btn" style={{ cursor: "pointer", alignItems: "center" }}>
        <FaPalette /> 文字色
        <input
          type="color"
          style={{ width: 30, height: 24, border: "none", marginLeft: 8, background: "transparent" }}
          onChange={e => onColorChange?.(e.target.value)}
          aria-label="文字色を選択"
        />
      </label>
      {/* --- ハイライト色ピッカー --- */}
      <label className="drawer-btn" style={{ cursor: "pointer", alignItems: "center" }}>
        <FaFillDrip /> ハイライト色
        <input
          type="color"
          style={{ width: 30, height: 24, border: "none", marginLeft: 8, background: "transparent" }}
          onChange={e => onHighlightColorChange?.(e.target.value)}
          aria-label="ハイライト色を選択"
        />
      </label>
      {/* --- フォントサイズ --- */}
      <label className="drawer-btn" style={{ cursor: "pointer", alignItems: "center" }}>
        <FaTextHeight /> サイズ
        <select
          style={{ marginLeft: 6, minWidth: 60 }}
          value={fontSize}
          onChange={e => onFontSizeChange?.(e.target.value)}
        >
          {FONT_SIZES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </label>
      {/* --- フォントファミリー --- */}
      <label className="drawer-btn" style={{ cursor: "pointer", alignItems: "center" }}>
        <FaFont /> フォント
        <select
          style={{ marginLeft: 6, minWidth: 90 }}
          value={fontFamily}
          onChange={e => onFontFamilyChange?.(e.target.value)}
        >
          {FONT_FAMILIES.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </label>
    </div>
    <style>{`
      .drawer-btn {
        border-radius: 8px; padding: 7px 12px; background: #f5f6fa;
        border: none; color: #333; font-size: 1.07rem; font-weight: 500;
        display: flex; align-items: center; gap: 6px; box-shadow: 0 1px 3px #0001;
        transition: background 0.14s;
      }
      .drawer-btn:hover, .drawer-btn:focus { background: #d0eaff; }
      .drawer-btn input[type="color"] {
        border: none; padding: 0; background: transparent;
      }
    `}</style>
  </div>
);

export default TextStyleDrawer;

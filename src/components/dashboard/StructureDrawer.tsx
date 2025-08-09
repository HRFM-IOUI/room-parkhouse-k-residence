"use client";
import React from "react";
import { FaHeading, FaListUl, FaListOl, FaCheckSquare, FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify, FaQuoteRight, FaCode,  } from "react-icons/fa";

type Props = {
  onHeading?: (level: 1 | 2 | 3) => void;
  onBulletList?: () => void;
  onOrderedList?: () => void;
  onTaskList?: () => void;
  onBlockquote?: () => void;
  onCodeBlock?: () => void;
  onAlign?: (type: "left" | "center" | "right" | "justify") => void;
};

export default function ParagraphStructureDrawer({
  onHeading,
  onBulletList,
  onOrderedList,
  onTaskList,
  onBlockquote,
  onCodeBlock,
  onAlign,
}: Props) {
  return (
    <div className="para-struct-drawer">
      <div className="mb-3 font-semibold">段落・構造レイアウト</div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => onHeading?.(1)} className="drawer-btn"><FaHeading />H1</button>
        <button onClick={() => onHeading?.(2)} className="drawer-btn"><FaHeading style={{ fontSize: 17 }} />H2</button>
        <button onClick={() => onHeading?.(3)} className="drawer-btn"><FaHeading style={{ fontSize: 15 }} />H3</button>
        <button onClick={onBulletList} className="drawer-btn"><FaListUl />箇条書き</button>
        <button onClick={onOrderedList} className="drawer-btn"><FaListOl />番号リスト</button>
        <button onClick={onTaskList} className="drawer-btn"><FaCheckSquare />チェックリスト</button>
        <button onClick={() => onAlign?.("left")} className="drawer-btn"><FaAlignLeft />左寄せ</button>
        <button onClick={() => onAlign?.("center")} className="drawer-btn"><FaAlignCenter />中央</button>
        <button onClick={() => onAlign?.("right")} className="drawer-btn"><FaAlignRight />右寄せ</button>
        <button onClick={() => onAlign?.("justify")} className="drawer-btn"><FaAlignJustify />両端</button>
        <button onClick={onBlockquote} className="drawer-btn"><FaQuoteRight />引用</button>
        <button onClick={onCodeBlock} className="drawer-btn"><FaCode />コード</button>
      </div>
      <style>{`
        .drawer-btn {
          border-radius: 8px; padding: 7px 12px; background: #f5f6fa;
          border: none; color: #333; font-size: 1.07rem; font-weight: 500;
          display: flex; align-items: center; gap: 6px; box-shadow: 0 1px 3px #0001;
          transition: background 0.14s;
        }
        .drawer-btn:hover, .drawer-btn:focus { background: #e1f4ff; }
      `}</style>
    </div>
  );
}

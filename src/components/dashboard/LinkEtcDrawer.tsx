"use client";
import React from "react";
import { FaLink, FaUnlink, FaEdit, FaYoutube, FaTwitter, FaRegFileVideo, FaMapMarkedAlt } from "react-icons/fa";

type Props = {
  onInsertLink?: () => void;
  onUnsetLink?: () => void;
  onEditLink?: () => void;
  onInsertYoutube?: () => void;
  onInsertX?: () => void;
  onInsertVideo?: () => void;
  onInsertMap?: () => void;
  onInsertHorizontalRule?: () => void;
};

export default function LinkEtcDrawer({
  onInsertLink,
  onUnsetLink,
  onEditLink,
  onInsertYoutube,
  onInsertX,
  onInsertVideo,
  onInsertMap,
  onInsertHorizontalRule,
}: Props) {
  return (
    <div className="link-etc-drawer">
      <div className="mb-3 font-semibold">リンク・拡張・埋め込み</div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={onInsertLink} className="drawer-btn"><FaLink />リンク追加</button>
        <button onClick={onUnsetLink} className="drawer-btn"><FaUnlink />リンク解除</button>
        <button onClick={onEditLink} className="drawer-btn"><FaEdit />リンク編集</button>
        <button onClick={onInsertYoutube} className="drawer-btn"><FaYoutube />YouTube埋め込み</button>
        <button onClick={onInsertX} className="drawer-btn"><FaTwitter />X(Twitter)埋め込み</button>
        {onInsertVideo && (
          <button onClick={onInsertVideo} className="drawer-btn"><FaRegFileVideo />動画埋め込み</button>
        )}
        {onInsertMap && (
          <button onClick={onInsertMap} className="drawer-btn"><FaMapMarkedAlt />GoogleMap</button>
        )}
        {onInsertHorizontalRule && (
          <button onClick={onInsertHorizontalRule} className="drawer-btn">― 横線</button>
        )}
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

"use client";
import React from "react";
import { FaImage, FaYoutube, FaTwitter, FaMapMarkerAlt, FaTable } from "react-icons/fa";

type Props = {
  onImage?: () => void;
  onYoutube?: () => void;
  onX?: () => void; // X (Twitter)
  onGoogleMap?: () => void;
  onTable?: () => void;
};

export default function MediaEmbedDrawer({
  onImage, onYoutube, onX, onGoogleMap, onTable
}: Props) {
  return (
    <div className="media-embed-drawer">
      <div className="mb-3 font-semibold">メディア・埋め込み</div>
      <div className="flex gap-3 flex-wrap">
        <button onClick={onImage} className="drawer-btn"><FaImage />画像</button>
        <button onClick={onYoutube} className="drawer-btn"><FaYoutube />YouTube</button>
        <button onClick={onX} className="drawer-btn"><FaTwitter />X(Twitter)</button>
        <button onClick={onGoogleMap} className="drawer-btn"><FaMapMarkerAlt />地図</button>
        <button onClick={onTable} className="drawer-btn"><FaTable />表組み</button>
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

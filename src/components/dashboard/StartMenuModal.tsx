"use client";
import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  onPost: () => void;
  onMedia: () => void;
  onBack: () => void;
};

export default function StartMenuModal({
  open, onClose, onSave, onPost, onMedia, onBack,
}: Props) {
  if (!open) return null;

  return (
    <div className="modal-bg">
      <div className="modal-content">
        <div className="font-bold text-lg mb-2 text-center">アクションメニュー</div>
        <button className="modal-menu-btn" onClick={() => { onSave(); onClose(); }}>
          下書き保存する（公開せず保存のみ）
        </button>
        <button className="modal-menu-btn" onClick={() => { onPost(); onClose(); }}>
          公開投稿する
        </button>
        <button className="modal-menu-btn" onClick={() => { onSave(); onMedia(); onClose(); }}>
          メディアライブラリへ
        </button>
        <button className="modal-menu-btn" onClick={() => { onBack(); onClose(); }}>
          戻る（ページ離脱）
        </button>
        <button className="modal-menu-btn mt-1 text-red-400" onClick={onClose}>
          キャンセル
        </button>
      </div>
      {/* モーダルの外側クリックで閉じる */}
      <style>{`
        .modal-bg {
          position: fixed; inset: 0; background: rgba(44,48,60,0.19); z-index: 1001;
          display: flex; align-items: center; justify-content: center;
        }
        .modal-content {
          background: #fff; border-radius: 16px; min-width: 320px; max-width: 92vw;
          padding: 32px 19px 20px 19px; box-shadow: 0 6px 24px #0003;
          display: flex; flex-direction: column; align-items: stretch;
        }
        .modal-menu-btn {
          margin: 8px 0; padding: 12px 2px; border-radius: 9px;
          background: #f6f8fb; color: #225; font-weight: 600; font-size: 1.09rem; border: none;
          transition: background 0.15s;
        }
        .modal-menu-btn:hover, .modal-menu-btn:focus {
          background: #d0eaff;
        }
      `}</style>
    </div>
  );
}

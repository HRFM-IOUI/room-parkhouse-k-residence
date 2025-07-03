"use client";
import React, { useRef, useState } from "react";
//import MenuDrawer from "../common/MenuDrawer";

const mainBlue = "#40a7e2";
const darkBlue = "#193257";
const gold = "#ffe082";
const goldDark = "#e0b100";
const inputBg = "#f9fcff";
const earOffset = 4.8;
const earTop = -43;
const earControlY = 2.4;

export default function Dashboard_MobileSwipeMenu() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const touchStartY = useRef<number | null>(null);

  // スワイプ検知
  const handleBarTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleBarTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (!drawerOpen && dy < -40) setDrawerOpen(true);
    touchStartY.current = null;
  };

  // 猫耳アニメーション
  const [earAnim, setEarAnim] = useState(false);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setEarAnim(true);
      setTimeout(() => setEarAnim(false), 500);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // テキスト入力（下部バーとモーダルで同期）
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const modalTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [text, setText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // テキストエリア自動リサイズ
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 110)}px`;
    }
  };
  const handleModalInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const el = modalTextareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 280)}px`;
    }
  };

  // 送信
  const handleSend = () => {
    if (!text.trim()) return;
    // ここでAPI送信等に置き換え
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "36px";
    if (modalTextareaRef.current) modalTextareaRef.current.style.height = "36px";
    setModalOpen(false);
  };

  // モーダル終了時に下部バーへフォーカス
  React.useEffect(() => {
    if (!modalOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [modalOpen]);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        minHeight: "100vh",
        background: "#f5fbf7",
        overflowX: "hidden",
        paddingBottom: 170,
      }}
    >
      
        {/* 必要なメニューUIのみ。ここもシンプルに */}
        <div style={{
          fontWeight: 900,
          fontSize: 19,
          color: mainBlue,
          marginBottom: 14,
          letterSpacing: 2
        }}>
          メニュー・機能
        </div>
        {/* 必要ならここにアイコンボタン群など */}

      {/* --- モーダル：ピンチアウト風テキストエディタ --- */}
      {modalOpen && (
        <div style={{
          position: "fixed",
          left: 0, top: 0, width: "100vw", height: "100vh",
          zIndex: 13000,
          background: "rgba(34,48,61,0.38)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              background: "#f8fcff",
              borderRadius: 26,
              boxShadow: "0 7px 42px #48a9ea55",
              padding: "36px 20px 24px 20px",
              width: "95vw",
              maxWidth: 520,
              minHeight: 250,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch"
            }}
            onClick={e => e.stopPropagation()}
          >
            <textarea
              ref={modalTextareaRef}
              value={text}
              placeholder="テキストを入力"
              onChange={handleModalInput}
              rows={4}
              style={{
                width: "100%",
                minHeight: 110,
                maxHeight: 320,
                fontSize: 18,
                fontWeight: 600,
                borderRadius: 17,
                border: "1.7px solid #aee6ff",
                background: "#fafffd",
                color: "#27435a",
                padding: "16px 12px",
                outline: "none",
                resize: "none",
                boxShadow: "0 1.5px 10px #8ac7e118",
                marginBottom: 28,
                lineHeight: 1.7,
                letterSpacing: 1,
              }}
            />
            <button
              type="button"
              style={{
                height: 44,
                borderRadius: 13,
                background: gold,
                color: darkBlue,
                border: `2px solid ${goldDark}`,
                fontWeight: 800,
                fontSize: 23,
                boxShadow: "0 2px 7px #ffe08255",
                cursor: "pointer",
                outline: "none",
                marginLeft: "auto",
                padding: "0 36px",
                letterSpacing: 1.5,
              }}
              onClick={handleSend}
              disabled={!text.trim()}
              aria-label="送信"
            >➣</button>
            <button
              style={{
                position: "absolute",
                right: 12,
                top: 9,
                fontSize: 28,
                background: "none",
                border: "none",
                color: "#8294a9",
                cursor: "pointer",
                fontWeight: 900,
              }}
              onClick={() => setModalOpen(false)}
              aria-label="閉じる"
            >×</button>
          </div>
        </div>
      )}

      {/* --- 猫型送信バー --- */}
      <div
        style={{
          position: "fixed",
          left: 0,
          bottom: 0,
          width: "100vw",
          display: "flex",
          alignItems: "end",
          justifyContent: "center",
          background: "none",
          zIndex: 1200,
          pointerEvents: "none",
          minHeight: 140,
        }}
      >
        <div
          style={{
            position: "relative",
            width: "96vw",
            maxWidth: 540,
            minHeight: 96,
            pointerEvents: "auto",
            marginBottom: 12,
          }}
        >
          {/* 左猫耳 */}
          <svg
            width="72"
            height="56"
            viewBox="-3 3 56 56"
            style={{
              position: "absolute",
              left: earOffset,
              top: earTop,
              zIndex: 2,
              filter: "drop-shadow(0 7px 7px #6ac2e866)",
              pointerEvents: "auto",
              cursor: "pointer",
              transition: "transform .35s cubic-bezier(.7,1.8,.3,1.3)",
              transform: earAnim ? "translateY(-11px) scale(1.13,1.19)" : "none",
            }}
            onClick={() => setDrawerOpen(true)}
          >
            <path d={`M6 55 Q28 ${earControlY} 51 52`} fill={mainBlue} stroke="#3797cd" strokeWidth="3.7" />
          </svg>
          {/* 右猫耳 */}
          <svg
            width="72"
            height="56"
            viewBox="-3 3 56 56"
            style={{
              position: "absolute",
              right: earOffset,
              top: earTop,
              zIndex: 2,
              filter: "drop-shadow(0 7px 7px #6ac2e866)",
              pointerEvents: "auto",
              cursor: "pointer",
              transition: "transform .35s cubic-bezier(.7,1.8,.3,1.3)",
              transform: earAnim ? "translateY(-11px) scale(1.13,1.19) scaleX(-1)" : "scaleX(-1)",
            }}
            onClick={() => setDrawerOpen(true)}
          >
            <path d={`M6 55 Q28 ${earControlY} 51 52`} fill={mainBlue} stroke="#3797cd" strokeWidth="3.7" />
          </svg>
          {/* 送信バー本体 */}
          <div
            style={{
              width: "100%",
              minHeight: 96,
              background: mainBlue,
              borderRadius: "40px 40px 60px 60px / 54px 54px 74px 74px",
              boxShadow: "0 4px 32px #69c1f470, 0 1.5px 18px #bdd7f9",
              display: "flex",
              alignItems: "center",
              padding: "0 30px 0 30px",
              transform: "scaleY(-1)",
            }}
            onTouchStart={handleBarTouchStart}
            onTouchEnd={handleBarTouchEnd}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              transform: "scaleY(-1)"
            }}>
              {/* ＋ボタン */}
              <button
                style={{
                  width: 48,
                  height: 48,
                  marginRight: 15,
                  borderRadius: "50%",
                  background: darkBlue,
                  border: `3.5px solid ${gold}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: gold,
                  fontSize: 29,
                  boxShadow: "0 2px 8px #1e335744",
                  outline: "none",
                  cursor: "pointer",
                  fontWeight: 800,
                  flexShrink: 0,
                  marginLeft: 2,
                }}
                tabIndex={-1}
              >
                ＋
              </button>
              {/* textarea＋送信ボタン */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: inputBg,
                  borderRadius: 32,
                  boxShadow: "0 2px 10px #eaf6fd",
                  padding: "0 7px 0 20px",
                  flex: 1,
                  minWidth: 0,
                  height: "auto",
                  position: "relative",
                  gap: 0,
                }}
              >
                <textarea
                  ref={textareaRef}
                  value={text}
                  placeholder="テキスト入力"
                  rows={1}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    background: "transparent",
                    border: "none",
                    borderRadius: 22,
                    padding: "10px 8px 10px 0px",
                    fontSize: 16,
                    color: "#515e70",
                    fontWeight: 600,
                    outline: "none",
                    resize: "none",
                    overflowY: "auto",
                    lineHeight: 1.6,
                    maxHeight: 110,
                  }}
                  onInput={handleInput}
                />
                {/* ↗︎拡大ボタン */}
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  style={{
                    height: 32,
                    width: 32,
                    borderRadius: "50%",
                    background: "#f7faff",
                    border: "1.7px solid #cde4f9",
                    color: mainBlue,
                    fontWeight: 900,
                    fontSize: 18,
                    marginLeft: 2,
                    marginRight: 3,
                    boxShadow: "0 1.5px 6px #d2edfc",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    outline: "none",
                  }}
                  tabIndex={-1}
                  aria-label="拡大"
                >↗︎</button>
                <button
                  type="button"
                  style={{
                    height: 36,
                    width: 44,
                    padding: 0,
                    borderRadius: 15,
                    background: gold,
                    color: darkBlue,
                    border: `2px solid ${goldDark}`,
                    fontWeight: 800,
                    fontSize: 26,
                    boxShadow: "0 2px 6px #ffe08255",
                    cursor: "pointer",
                    outline: "none",
                    flexShrink: 0,
                    marginLeft: 5,
                    marginRight: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background .12s",
                  }}
                  onClick={handleSend}
                  disabled={!text.trim()}
                  aria-label="送信"
                >➣</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React from "react";

type ABXYLabel = "A" | "B" | "X" | "Y";
type Props = {
  onA: () => void;
  onB: () => void;
  onX: () => void;
  onY: () => void;
  onStart: () => void;  // GOLD START
};

function ABXYButton({ label, onClick }: { label: ABXYLabel; onClick: () => void }) {
  return (
    <button
      className="abxy-btn w-14 h-14 rounded-full flex items-center justify-center border-2
        border-white/70 active:scale-95 transition-all duration-100 shadow-lg"
      onClick={onClick}
      style={{
        background: "linear-gradient(145deg,rgba(30,30,30,0.86) 35%,rgba(80,80,80,0.13) 100%)",
        boxShadow: "0 6px 22px rgba(20,20,25,0.28), 0 0 0 2.5px #fff4",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        pointerEvents: "auto",
        userSelect: "none",
      }}
    >
      <span
        className="text-[1.7rem] font-extrabold select-none drop-shadow-[0_2px_7px_#2228,0_0px_4px_#fff8]"
        style={{
          color: "white",
          letterSpacing: "1.5px",
          textShadow: "0 2px 7px #111a, 0 0px 4px #fff8, 0 1px 0px #0008",
        }}
      >
        {label}
      </span>
    </button>
  );
}

// --- すべてのprops（onClick, style, classNameなど）を受け入れるよう型を修正！ ---
export function StartButton({
  onClick,
  style,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { onClick: () => void }) {
  return (
    <button
      className="start-btn flex items-center justify-center rounded-full font-bold text-lg border-2 shadow-lg active:scale-95 transition-all"
      onClick={onClick}
      {...props}
      style={{
        width: 78,
        height: 41,
        position: "absolute",
        left: "50%",
        bottom: 65,
        transform: "translateX(-50%)",
        zIndex: 51,
        background: "linear-gradient(145deg,rgba(30,30,30,0.95) 65%,rgba(80,80,80,0.15) 100%)",
        boxShadow: "0 4px 20px rgba(50,45,20,0.27), 0 0 0 2.5px #fff4",
        borderColor: "#ecd976",
        borderWidth: "2.4px",
        backdropFilter: "blur(7px)",
        WebkitBackdropFilter: "blur(7px)",
        pointerEvents: "auto",
        userSelect: "none",
        padding: 0,
        ...(style || {}),
      }}
    >
      <span
        style={{
          fontSize: "1.15rem",
          fontWeight: 900,
          letterSpacing: "2.3px",
          background: "linear-gradient(90deg,#f7e372 18%,#e0be4a 55%,#fff7a2 90%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 1.5px 6px #fff7, 0 1.5px 11px #fce17b8c, 0 2px 7px #0008",
        }}
      >
        START
      </span>
    </button>
  );
}

export default function ABXYPad({
  onA, onB, onX, onY, onStart,
}: Props) {
  // 必ずGOLD START採用
  return (
    <div className="fixed left-0 bottom-0 w-full h-[200px] z-50 select-none">
      <div className="absolute" style={{ left: "7vw", bottom: "70px" }}>
        <ABXYButton label="Y" onClick={onY} />
      </div>
      <div className="absolute" style={{ left: "18vw", bottom: "24px" }}>
        <ABXYButton label="X" onClick={onX} />
      </div>
      <div className="absolute" style={{ right: "18vw", bottom: "24px" }}>
        <ABXYButton label="A" onClick={onA} />
      </div>
      <div className="absolute" style={{ right: "7vw", bottom: "70px" }}>
        <ABXYButton label="B" onClick={onB} />
      </div>
      <StartButton onClick={onStart} />
    </div>
  );
}

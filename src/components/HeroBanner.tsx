"use client";
import React, { useRef, useEffect, useState } from "react";
import { ParallaxProvider, Parallax } from "react-scroll-parallax";

// ブランド感Serif推奨（Google Fonts推奨）
const brandFont = '"Playfair Display", "Noto Serif JP", serif';

const slides = [
  { img: "/0001phoc-herobanner.webp" },
  { img: "/IMG_5614.webp" },
  { img: "/IMG_5615.webp" },
];

const news = [
  { date: "2025.06.30", title: "新サービス開始のお知らせ" },
  { date: "2025.06.25", title: "サイトリニューアルしました" },
  { date: "2025.06.20", title: "特別イベント開催情報" },
];

const DISPLAY_TIME = 5200;
const DISSOLVE_TIME = 2000;

export default function HeroBanner() {
  const [current, setCurrent] = useState<number>(0);
  const [next, setNext] = useState<number | null>(null);
  const [allLoaded, setAllLoaded] = useState(false);
  const [progress, setProgress] = useState<number>(1);
  const [showImg, setShowImg] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgsRef = useRef<(HTMLImageElement | null)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

  // 画像事前ロード＋onload監視
  useEffect(() => {
    let loadedCount = 0;
    imgsRef.current = slides.map(({ img }, idx) => {
      const el = new window.Image();
      el.src = img;
      el.onload = () => {
        loadedCount += 1;
        if (loadedCount === slides.length) setAllLoaded(true);
      };
      el.onerror = () => setAllLoaded(true); // エラー時も続行
      return el;
    });
  }, []);

  // 初回だけimgタグで爆速レンダ
  useEffect(() => {
    if (allLoaded) {
      setTimeout(() => setShowImg(false), 80);
    }
  }, [allLoaded]);

  // クロスディゾルブアニメ
  useEffect(() => {
    if (next === null || showImg) return;
    let start: number | null = null;
    setProgress(0);

    function animate(now: number) {
      if (!start) start = now;
      let t = (now - start) / DISSOLVE_TIME;
      if (t > 1) t = 1;
      setProgress(t);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const img1 = imgsRef.current[current];
      const img2 = imgsRef.current[next!];
      const [w, h] = getCanvasSize();
      if (canvas && ctx && img1 && img2) {
        canvas.width = w;
        canvas.height = h;
        ctx.globalAlpha = 1 - t;
        ctx.drawImage(img1, 0, 0, w, h);
        ctx.globalAlpha = t;
        ctx.drawImage(img2, 0, 0, w, h);
        ctx.globalAlpha = 1;
      }
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCurrent(next!);
        setNext(null);
        setProgress(1);
      }
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [next, current, showImg]);

  // タイマー管理
  useEffect(() => {
    if (next !== null || showImg) return;
    timeoutRef.current = setTimeout(() => {
      setNext((current + 1) % slides.length);
    }, DISPLAY_TIME);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, next, showImg]);

  // スマホ対応サイズ補正
  function getCanvasSize() {
    if (typeof window === "undefined") return [1440, 440];
    if (window.innerWidth < 640) return [window.innerWidth * 0.97, window.innerWidth * 0.45];
    return [1440, 440];
  }

  // canvasにcurrent描画
  useEffect(() => {
    if (next !== null || showImg) return;
    const [w, h] = getCanvasSize();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imgsRef.current[current];
    if (canvas && ctx && img) {
      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      ctx.drawImage(img, 0, 0, w, h);
    }
  }, [current, next, showImg]);

  // リサイズ時の再描画
  useEffect(() => {
    function handleResize() {
      if (next !== null || showImg) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const [w, h] = getCanvasSize();
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      const img = imgsRef.current[current];
      if (ctx && img) {
        ctx.clearRect(0, 0, w, h);
        ctx.globalAlpha = 1;
        ctx.drawImage(img, 0, 0, w, h);
      }
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [current, next, showImg]);

  // --- レンダリング ---
  return (
    <ParallaxProvider>
      <section
        className="w-full flex justify-center items-center min-h-[320px] sm:min-h-[540px] py-8 sm:py-16 px-0 relative"
        style={{
          background: "linear-gradient(120deg, #f8f6ef 0%, #f5f7fa 70%, #ecf4ef 100%)",
        }}
      >
        {/* 上層パララックス光グラデーション */}
        <Parallax speed={-34} className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none">
          <svg width="100%" height="100%" viewBox="0 0 1500 560" fill="none" className="w-full h-full">
            <defs>
              <linearGradient id="heroGrad2" x1="0" y1="0" x2="1600" y2="600" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fffbe6" />
                <stop offset="0.36" stopColor="#f7e9b4" stopOpacity="0.16" />
                <stop offset="0.7" stopColor="#ecd98b" stopOpacity="0.16" />
                <stop offset="1" stopColor="#ecf4ef" stopOpacity="0.23" />
              </linearGradient>
            </defs>
            <rect x="0" y="36" width="1500" height="440" rx="40" fill="url(#heroGrad2)" />
            <ellipse cx="1180" cy="148" rx="90" ry="27" fill="#f6e27a" opacity="0.13" />
            <rect x="1250" y="90" width="160" height="8" rx="4" fill="#fffbe6" opacity="0.10" />
          </svg>
        </Parallax>

        {/* 中央ビジュアル */}
        <div className="w-full max-w-[96vw] sm:max-w-[1340px] mx-auto px-2 relative z-20">
          <div className="relative w-full aspect-[16/8] sm:aspect-[16/7] rounded-[2.2rem] shadow-2xl overflow-visible border border-[#ecd98b]/40 bg-white/60 backdrop-blur-2xl flex items-center justify-center">
            {/* 金の光沢縁 */}
            <div className="absolute -inset-1.5 rounded-[2.6rem] pointer-events-none"
              style={{
                background: "linear-gradient(90deg,#ecd98b44 0%,#fffbe6bb 80%,#ecd98b44 100%)",
                opacity: 0.45,
                filter: "blur(4px)",
                zIndex: 8,
              }} />
            {/* Main画像/Canvas */}
            {showImg ? (
              <img
                src={slides[current].img}
                alt="hero"
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "2.1rem",
                  boxShadow: "0 8px 40px 0 #ecd98b33, 0 1.5px 8px 0 #fffbe680",
                  background: "#fffbe6",
                  transition: "box-shadow .25s cubic-bezier(.7,.23,.2,1)",
                }}
                draggable={false}
              />
            ) : (
              <canvas
                ref={canvasRef}
                width={getCanvasSize()[0]}
                height={getCanvasSize()[1]}
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  borderRadius: "2.1rem",
                  objectFit: "cover",
                  background: "#fffbe6",
                  boxShadow: "0 8px 40px 0 #ecd98b33, 0 1.5px 8px 0 #fffbe680",
                  transition: "box-shadow .25s cubic-bezier(.7,.23,.2,1)",
                }}
              />
            )}

            {/* ブランドラベル */}
            <div className="absolute left-0 top-0 px-8 py-5 z-20 flex flex-col gap-4 pointer-events-none select-none"
              style={{ fontFamily: brandFont }}
            >
              <span className="text-[1.86rem] sm:text-[1.8rem] font-extrabold tracking-tight text-[#bfa14a] drop-shadow-md"
                style={{
                  textShadow: "0 1px 18px #fffbe688, 0 0px 2px #ecd98b",
                  letterSpacing: "0.05em",
                  fontFamily: brandFont,
                }}
              >
                The Parkhouse Kamishakujii Residence
              </span>
              <span className="block text-[1.12rem] sm:text-[1.32rem] text-[#8c8348] tracking-wide font-bold opacity-80"
                style={{ letterSpacing: "0.12em" }}>
                上石神井 － The Parkhouse Residence
              </span>
            </div>

            {/* NEWS欄（PC重なり/スマホ下段） */}
            <div className="hidden sm:flex">
              <div
                className="
                  w-[360px] h-full absolute top-0 right-0
                  bg-white/86
                  rounded-r-[2.1rem]
                  flex flex-col justify-center px-10 py-10
                  border-l border-[#ecd98b]/30
                  shadow-2xl
                  backdrop-blur-[8px]
                  z-30
                "
                style={{
                  boxShadow: "0 8px 44px 0 rgba(212,175,55,0.18)",
                  fontFamily: brandFont,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-7 bg-gradient-to-b from-[#ecd98b] to-[#fffbe6] rounded-full" />
                  <div className="text-[#bfa14a] font-bold text-xs tracking-widest font-mono">
                    NEWS
                  </div>
                </div>
                <ul className="space-y-5 text-[16.2px] text-[#594f28]">
                  {news.map((item, idx) => (
                    <li key={idx} className="flex flex-col">
                      <span className="text-xs text-[#bfa14a] mb-1 font-mono">
                        {item.date}
                      </span>
                      <span className="font-medium">{item.title}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-8 text-[#bfa14a] text-[14.5px] font-bold hover:underline hover:text-[#d4af37] transition">
                  すべて見る →
                </button>
              </div>
            </div>
          </div>

          {/* スマホ：画像の下にNEWS欄 */}
          <div className="block sm:hidden mt-8 w-full flex justify-center">
            <div className="
              w-full max-w-[670px]
              bg-white/90
              rounded-[1.7rem]
              flex flex-col justify-center px-7 py-8 border border-[#ecd98b]/40 shadow-inner
            " style={{ fontFamily: brandFont }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-7 bg-gradient-to-b from-[#ecd98b] to-[#fffbe6] rounded-full" />
                <div className="text-[#bfa14a] font-bold text-xs tracking-widest font-mono">
                  NEWS
                </div>
              </div>
              <ul className="space-y-5 text-[16px] text-[#594f28]">
                {news.map((item, idx) => (
                  <li key={idx} className="flex flex-col">
                    <span className="text-xs text-[#bfa14a] mb-1 font-mono">
                      {item.date}
                    </span>
                    <span className="font-medium">{item.title}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-8 text-[#bfa14a] text-[14px] font-bold hover:underline hover:text-[#d4af37] transition">
                すべて見る →
              </button>
            </div>
          </div>
        </div>
      </section>
    </ParallaxProvider>
  );
}

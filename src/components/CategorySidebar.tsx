import React from "react";
import {
  HiOutlineSparkles,
  HiOutlineHome,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineGlobe,
  HiOutlineUserGroup,
  HiOutlineDeviceMobile,
  HiOutlineAcademicCap,
  HiOutlineAdjustments,
  HiOutlineLightBulb,
  HiOutlineCog
} from "react-icons/hi";

// 1度だけ定義
const CATEGORY_ICON_MAP: { [key: string]: React.ReactNode } = {
  vision: <HiOutlineSparkles className="text-[#bfa14a] w-5 h-5 mr-2" />,
  specs: <HiOutlineAdjustments className="text-[#bfa14a] w-5 h-5 mr-2" />,
  announcement: <HiOutlineBell className="text-[#bfa14a] w-5 h-5 mr-2" />,
  usecase: <HiOutlineShieldCheck className="text-[#bfa14a] w-5 h-5 mr-2" />,
  research: <HiOutlineGlobe className="text-[#bfa14a] w-5 h-5 mr-2" />,
  culture: <HiOutlineUserGroup className="text-[#bfa14a] w-5 h-5 mr-2" />,
  technology: <HiOutlineDeviceMobile className="text-[#bfa14a] w-5 h-5 mr-2" />,
  education: <HiOutlineAcademicCap className="text-[#bfa14a] w-5 h-5 mr-2" />,
  policy: <HiOutlineLightBulb className="text-[#bfa14a] w-5 h-5 mr-2" />,
  philosophy: <HiOutlineCog className="text-[#bfa14a] w-5 h-5 mr-2" />,
  worldview: <HiOutlineHome className="text-[#bfa14a] w-5 h-5 mr-2" />,
};

const DEFAULT_CATEGORY_MAP: { [key: string]: string } = {
  vision: "管理組合",
  specs: "理事会",
  announcement: "検討委員会",
  usecase: "防災",
  research: "地域情報",
  culture: "管理室より",
  technology: "ペット",
  education: "季節イベント",
  policy: "環境美化",
  philosophy: "今期理事",
  worldview: "その他",
};

type Props = {
  categories: string[];
  selected: string;
  setSelected: (cat: string) => void;
  categoryMap?: Record<string, string>;
};

export default function CategorySidebar({
  categories,
  selected,
  setSelected,
  categoryMap = DEFAULT_CATEGORY_MAP,
}: Props) {
  return (
    <nav
      className={`
        hidden lg:flex flex-col sticky top-[88px] z-10
        max-h-[calc(100vh-112px)] min-w-[210px] max-w-[260px]
        rounded-2xl bg-gradient-to-br from-[#fffbe6] via-[#fcf6e2] to-[#faf8ef]
        border-l-[6px] border-gradient-to-b from-[#d4af37] to-[#bfa14a]
        shadow-[0_8px_32px_0_rgba(212,175,55,0.12)]
        py-8 px-4 mr-3
        overflow-y-auto scrollbar-thin scrollbar-thumb-[#e8e0be] scrollbar-track-transparent
        transition-all
      `}
      style={{
        boxShadow: "0 8px 36px 0 rgba(212,175,55,0.09), 0 1.5px 8px 0 #d4af3727",
      }}
    >
      <h3 className="font-bold text-[#bfa14a] text-lg mb-7 ml-2 tracking-widest select-none drop-shadow">
        カテゴリー
      </h3>
      <ul className="flex flex-col gap-2">
        <li>
          <button
            className={`
              flex items-center gap-2 px-5 py-2 rounded-full text-left w-full font-semibold
              bg-gradient-to-r from-[#fffbe6] via-[#e3e8fc] to-[#bfa14a]
              text-[#192349] shadow-lg hover:scale-[1.04]
              ${selected === "" ? "ring-2 ring-[#bfa14a]/50" : "opacity-80 hover:ring-2 hover:ring-[#ecd98b]/60"}
              transition-all duration-200
            `}
            onClick={() => setSelected("")}
          >
            <HiOutlineHome className="text-[#bfa14a] w-5 h-5 mr-2" />
            すべて
          </button>
        </li>
        {categories.map((c) => (
          <li key={c}>
            <button
              className={`
                flex items-center gap-2 px-5 py-2 rounded-full text-left w-full font-semibold
                bg-white/80 hover:bg-gradient-to-r hover:from-[#fffbe6] hover:to-[#ecd98b]
                text-[#1e1b13] hover:scale-[1.03]
                ${selected === c
                  ? "ring-2 ring-[#bfa14a]/80 bg-gradient-to-r from-[#fffbe6] via-[#ecd98b] to-[#bfa14a] text-[#192349] shadow-md"
                  : "opacity-85 hover:ring-2 hover:ring-[#d4af37]/40"}
                transition-all duration-200
              `}
              onClick={() => setSelected(c)}
            >
              {CATEGORY_ICON_MAP[c] || <HiOutlineCog className="text-[#bfa14a] w-5 h-5 mr-2" />}
              <span className="truncate">{categoryMap[c] || c}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

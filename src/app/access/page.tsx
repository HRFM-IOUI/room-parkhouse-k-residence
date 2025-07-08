import Link from "next/link";

export default function Access() {
  return (
    <main className="bg-gradient-to-b from-[#faf5e9] to-[#f6f3e8] min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white/80 rounded-2xl shadow-lg p-8 border border-[#f5e8ce]">
        <h1 className="text-2xl md:text-3xl font-bold text-[#b29e65] mb-4 text-center tracking-wide">
          アクセス
        </h1>
        <div className="mb-8 flex justify-center">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3240.742258721547!2d139.58609591525886!3d35.73437228018232!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6018ef7b8a36c239%3A0xaea1edb1e1542c3c!2z44CSMTc3LTAwNDMg5p2x5Lqs6YO95a6u5LiK5L2P6Ieq55S677yS5LiB55uu77yX4oiS77yR77yX!5e0!3m2!1sja!2sjp!4v1621045282857!5m2!1sja!2sjp"
            className="w-full h-64 rounded-xl border border-[#f5e8ce] shadow-sm"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        <div className="space-y-6 text-center">
          <div>
            <div className="text-lg font-semibold text-[#b29e65] mb-2">電車でお越しの方</div>
            <div className="mb-1">西武新宿線 <span className="font-bold">上石神井駅（北口）徒歩11分</span></div>
            <div>西武新宿線 <span className="font-bold">武蔵関駅（北口）徒歩9分</span></div>
          </div>
          <div>
            <div className="text-lg font-semibold text-[#b29e65] mb-2">バスでお越しの方</div>
            <div>
              ・大泉学園駅より上石神井駅行き「上石神井駅」（終点）下車 徒歩11分
            </div>
            <div>
              ・大泉学園駅より西荻窪駅行き「上石神井駅」下車 徒歩11分
            </div>
          </div>
        </div>
        {/* トップページに戻るボタン */}
        <div className="mt-10 flex justify-center">
          <Link href="/" passHref>
            <span className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-[#e6d6a8] to-[#fffbe8] border border-[#dcc896] text-[#b29e65] font-semibold shadow hover:shadow-md hover:bg-[#f8f1de] transition-all duration-150 cursor-pointer">
              トップページに戻る
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}

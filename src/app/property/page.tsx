import Link from "next/link";

export default function Property() {
  return (
    <main className="bg-gradient-to-b from-[#faf5e9] to-[#f6f3e8] min-h-screen py-12 px-4">
      <section className="w-full max-w-2xl mx-auto mt-8">
        <div className="bg-white/90 rounded-2xl shadow-lg border border-[#f5e8ce] p-7 md:p-10">
          <h2 className="text-xl md:text-2xl font-bold text-[#b29e65] mb-7 tracking-wide">
            物件概要
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-gray-700">
            <div className="font-semibold text-[#b29e65]">マンション名</div>
            <div>ザ・パークハウス上石神井レジデンス</div>
            <div className="font-semibold text-[#b29e65]">マンション番号</div>
            <div>P0027217</div>
            <div className="font-semibold text-[#b29e65]">所在地</div>
            <div>東京都練馬区上石神井4丁目</div>
            <div className="font-semibold text-[#b29e65]">交通</div>
            <div>
              西武新宿線「武蔵関」駅 徒歩9分<br />
              西武新宿線「上石神井」駅 徒歩11分
            </div>
            <div className="font-semibold text-[#b29e65]">構造</div>
            <div>RC造3階地下1階建（一部S造）</div>
            <div className="font-semibold text-[#b29e65]">築年月</div>
            <div>2015年1月</div>
            <div className="font-semibold text-[#b29e65]">総戸数</div>
            <div>142戸</div>
            <div className="font-semibold text-[#b29e65]">専有面積</div>
            <div>67.44m²～83.61m²</div>
            <div className="font-semibold text-[#b29e65]">敷地面積</div>
            <div>9,421.69m²</div>
            <div className="font-semibold text-[#b29e65]">分譲会社</div>
            <div>三菱地所レジデンス(株)</div>
            <div className="font-semibold text-[#b29e65]">施工会社</div>
            <div>木内建設(株)</div>
            <div className="font-semibold text-[#b29e65]">設計会社</div>
            <div>木内建設(株)一級建築士事務所</div>
            <div className="font-semibold text-[#b29e65]">ブランド</div>
            <div>パークハウス</div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-2xl mx-auto mt-8">
        <div className="bg-gradient-to-br from-[#faf5e9] via-[#f6f3e8] to-[#f8f5ef] border border-[#f6ecd6] rounded-2xl shadow p-6 md:p-8">
          <h3 className="text-lg md:text-xl font-bold text-[#b29e65] mb-4">おすすめポイント</h3>
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            <li>南向きの3LDK住戸、専用庭・テラス付</li>
            <li>2015年1月築、三菱地所レジデンス(株)旧分譲マンション</li>
            <li>大切なペットと一緒に暮らせます（細則あり）</li>
            <li>1階部分は階下への生活音を気にせず暮らせます</li>
            <li>南向きの明るいLDKは約14.0帖の広さ</li>
            <li>会話が弾む対面式キッチン</li>
            <li>洋室約6.0帖はWIC付き</li>
            <li>24時間ゴミ出し可</li>
          </ul>
          <h4 className="mt-5 mb-2 font-semibold text-[#b29e65]">設備</h4>
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            <li>床暖房（LDK）</li>
            <li>食洗機</li>
            <li>浴室ミストサウナ・浴室換気乾燥暖房機能付き</li>
          </ul>
        </div>
      </section>

      {/* トップページに戻るボタン */}
      <div className="mt-10 flex justify-center">
        <Link href="/" passHref>
          <span className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-[#e6d6a8] to-[#fffbe8] border border-[#dcc896] text-[#b29e65] font-semibold shadow hover:shadow-md hover:bg-[#f8f1de] transition-all duration-150 cursor-pointer">
            トップページに戻る
          </span>
        </Link>
      </div>
    </main>
  );
}

import Link from "next/link";

export default function Facility() {
  return (
    <main className="bg-gradient-to-b from-[#faf5e9] to-[#f6f3e8] min-h-screen py-12 px-4">
      <section className="w-full max-w-2xl mx-auto mt-8">
        <div className="bg-white/90 rounded-2xl shadow-lg border border-[#f5e8ce] p-7 md:p-10">
          <h2 className="text-xl md:text-2xl font-bold text-[#b29e65] mb-7 tracking-wide">
            共用施設のご案内
          </h2>
          <ul className="list-disc list-inside text-gray-800 space-y-2">
            <li>駐車場・駐輪場：敷地内にあり（台数・区画の詳細や申込方法は管理会社まで）</li>
            <li>バイク置き場：屋外専用スペース</li>
            <li>集会室：住民の会合やイベントに利用可（事前予約制）</li>
            <li>宅配ボックス：24時間利用可能</li>
            <li>ゴミ置き場：24時間ゴミ出し可／分別ルールあり</li>
            <li>ペット足洗い場：ペット飼育者専用共用部あり</li>
            {/* 必要に応じて追加 */}
          </ul>
        </div>
      </section>

      <section className="w-full max-w-2xl mx-auto mt-8">
        <div className="bg-gradient-to-br from-[#faf5e9] via-[#f6f3e8] to-[#f8f5ef] border border-[#f6ecd6] rounded-2xl shadow p-6 md:p-8">
          <h3 className="text-lg md:text-xl font-bold text-[#b29e65] mb-4">住民サービス内容</h3>
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            <li>管理員（日勤）：受付・問合せ対応</li>
            <li>定期清掃・植栽管理</li>
            <li>防犯カメラ運用・オートロックシステム</li>
            <li>防災倉庫・備蓄品の整備</li>
          </ul>
        </div>
      </section>

      <section className="w-full max-w-2xl mx-auto mt-8">
        <div className="bg-white/90 rounded-2xl shadow-lg border border-[#f5e8ce] p-7 md:p-10">
          <h3 className="text-lg md:text-xl font-bold text-[#b29e65] mb-4">ご利用方法・ルール</h3>
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            <li>駐車場・駐輪場の申込・利用方法は管理会社または1Fメインエントラス管理室までお問合せください。</li>
            <li>ゴミ出しルール：分別・曜日遵守／粗大ごみの出し方案内</li>
            <li>共用施設のご予約や利用規約は管理室へご確認ください。</li>
            <li>共用廊下の自転車走行は禁止されています。</li>
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

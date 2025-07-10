import Link from "next/link";

export default function Lifestyle() {
  return (
    <main className="bg-gradient-to-b from-[#faf5e9] to-[#f6f3e8] min-h-screen py-12 px-4">
      <section className="w-full max-w-2xl mx-auto mt-8">
        <div className="bg-white/90 rounded-2xl shadow-lg border border-[#f5e8ce] p-7 md:p-10">
          <h2 className="text-xl md:text-2xl font-bold text-[#b29e65] mb-6 tracking-wide">
            周辺環境・生活施設
          </h2>
          <ul className="list-disc list-inside text-gray-800 space-y-2">
            <li>スーパー：サミットストア石神井台店（徒歩8分）</li>
            <li>小学校：上石神井小学校（学区）</li>
            <li>病院：上石神井クリニックモール</li>
            {/* 必要なら追加 */}
          </ul>
        </div>
      </section>

      <section className="w-full max-w-2xl mx-auto mt-8">
        <div className="bg-gradient-to-br from-[#faf5e9] via-[#f6f3e8] to-[#f8f5ef] border border-[#f6ecd6] rounded-2xl shadow p-6 md:p-8">
          <h3 className="text-lg md:text-xl font-bold text-[#b29e65] mb-4">マンションでの暮らし・サービス</h3>
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            <li>24時間ゴミ出し可能</li>
            <li>ペット飼育可（規約あり／お散歩ルートも周辺に）</li>
            <li>宅配ボックス／オートロック／防犯カメラ</li>
            <li>管理会社による日常清掃／植栽管理</li>
            <li>敷地内駐車場・駐輪場</li>
            {/* 必要なら追加 */}
          </ul>
        </div>
      </section>

      <section className="w-full max-w-2xl mx-auto mt-8">
        <div className="bg-white/90 rounded-2xl shadow-lg border border-[#f5e8ce] p-7 md:p-10">
          <h3 className="text-lg md:text-xl font-bold text-[#b29e65] mb-4">コミュニティ・イベント</h3>
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            <li>理事会主催の防災訓練・清掃活動</li>
            <li>年末年始・七夕等のイベント開催</li>
            <li>住民サークル活動（検討委員会・キッズ・ペット・防災…）</li>
            {/* 必要なら追加 */}
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

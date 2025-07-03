export default function ThanksPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-[#f8f8f8] px-4">
      <div className="w-full max-w-lg bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-[#e8dab2] p-8 text-center">
        <h1 className="text-3xl font-bold text-[#bfa14a] mb-4">送信完了</h1>
        <p className="text-[#192349] mb-6">
          お問い合わせありがとうございました。<br />
          担当者よりご連絡いたします。
        </p>
        <a
          href="/"
          className="inline-block bg-gradient-to-r from-[#bfa14a] to-[#d4af37] text-white px-8 py-3 rounded-full shadow-md hover:scale-105 transition-all"
        >
          トップページに戻る
        </a>
      </div>
    </div>
  );
}

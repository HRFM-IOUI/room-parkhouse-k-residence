// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="
        min-h-[72vh] grid place-items-center px-4
        bg-[radial-gradient(120%_80%_at_70%_10%,#fffbe6_0%,#f6f4eb_45%,#eef2f7_100%)]
      "
    >
      <div className="text-center max-w-xl w-full">
        {/* 404 big mark */}
        <div className="text-[64px] sm:text-[84px] font-extrabold leading-none tracking-tight
                        bg-clip-text text-transparent
                        bg-[conic-gradient(from_200deg,#d4af37,#fff3b0,#bfa14a,#d4af37)]
                        drop-shadow-[0_4px_16px_rgba(212,175,55,.18)]">
          404
        </div>

        <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-[#1e2433]">
          ページが見つかりません
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#556070]">
          入力されたURLが誤っているか、ページが移動・削除された可能性があります。
        </p>

        {/* actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full px-6 py-3
                       font-semibold text-[#1e2433]
                       bg-white/90 border border-[#e7e0c9]
                       shadow-[0_4px_16px_rgba(212,175,55,.15)]
                       hover:bg-[#fff7db] hover:shadow-[0_8px_24px_rgba(212,175,55,.25)]
                       transition"
          >
            トップへ戻る
          </Link>
          <Link
            href="/posts"
            className="inline-flex items-center justify-center rounded-full px-6 py-3
                       font-semibold text-[#8a7a51]
                       bg-gradient-to-r from-[#fff5cc] to-[#f9edcc]
                       border border-[#e7d59a]
                       hover:from-[#fff0b3] hover:to-[#f6e7b8]
                       transition"
          >
            お知らせ一覧へ
          </Link>
        </div>

        {/* subtle help text */}
        <p className="mt-6 text-xs text-[#7b858f]">
          お困りの場合は <Link href="/contact" className="underline hover:no-underline">お問い合わせ</Link> からご連絡ください。
        </p>
      </div>
    </main>
  );
}

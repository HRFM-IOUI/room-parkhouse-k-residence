"use client";
import Link from "next/link";
import Image from "next/image";

// --- Post型：slugも含めておく！ ---
type Post = {
  id: string;
  title: string;
  createdAt: string | number | { seconds?: number };
  richtext: string;
  image?: string;
  tags?: string[];
  category?: string[];
  slug?: string; // ←ここ大事
};

// --- Props
type Props = {
  posts: Post[];
  isSearchResult?: boolean;
};

// --- 日付整形
function formatDate(dateVal: string | number | { seconds?: number }): string {
  if (!dateVal) return "";
  let d: Date;
  if (typeof dateVal === "object" && "seconds" in dateVal && typeof dateVal.seconds === "number") {
    d = new Date(dateVal.seconds * 1000);
  } else {
    d = new Date(dateVal as string | number);
  }
  return d.toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" });
}

// --- サムネイル画像抽出
function extractThumbnail(post: Post): string {
  const match = post.richtext?.match(/<img\s[^>]*src=["']([^"']+)["'][^>]*>/i);
  if (match && match[1]) return match[1];
  if (post.image) return post.image;
  return "/phoc.png";
}

// --- 本文サマリー
function getSummary(post: Post) {
  if (!post.richtext) return "";
  const plain = post.richtext.replace(/<[^>]+>/g, "").trim();
  return plain.length > 80 ? plain.slice(0, 80) + "..." : plain;
}

// --- URL生成（slug優先/ID fallback）---
const getPostUrl = (post: Post) =>
  post.slug && post.slug.length > 0
    ? `/posts/${post.slug}`
    : `/posts/${post.id}`;

// --- カテゴリ整形
function renderCategories(categoryArr?: string[]) {
  if (!categoryArr || categoryArr.length === 0) return "未分類";
  return categoryArr.map(cat =>
    <span key={cat}
      className="inline-block bg-[#e3e8fc] text-xs text-[#192349] font-semibold px-2 py-0.5 rounded-full mr-1"
    >
      {cat}
    </span>
  );
}

// --- サムネイルエラー時デフォ画像
function onImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget;
  if (!target.src.endsWith("/phoc.png")) {
    target.src = "/phoc.png";
  }
}

export default function ArticleGrid({ posts, isSearchResult = false }: Props) {
  if (!posts.length) return null;

  const useHeroCard = !isSearchResult && posts.length > 1;
  const heroPost: Post | null = useHeroCard ? posts[0] : null;
  const gridPosts: Post[] = useHeroCard ? posts.slice(1) : posts;

  return (
    <div className="flex flex-col gap-10">
      {/* --- Heroカード --- */}
      {heroPost && (
        <Link href={getPostUrl(heroPost)}>
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl flex flex-col sm:flex-row overflow-hidden group hover:shadow-2xl transition-all duration-200">
            <div className="sm:w-1/2 w-full">
              <Image
                src={extractThumbnail(heroPost)}
                alt={heroPost.title}
                width={600}
                height={320}
                className="w-full h-60 sm:h-[320px] object-cover group-hover:opacity-95 transition"
                priority
                onError={onImageError}
              />
            </div>
            <div className="sm:w-1/2 w-full flex flex-col justify-center p-6">
              <div className="mb-2 flex flex-wrap items-center">
                {renderCategories(heroPost.category)}
                {heroPost.tags?.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="ml-2 bg-gray-200 text-xs text-gray-600 font-semibold px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#192349] mb-2 line-clamp-2 group-hover:underline">
                {heroPost.title}
              </h2>
              <p className="text-gray-700 text-base mb-3 line-clamp-3">
                {getSummary(heroPost)}
              </p>
              <p className="text-xs text-gray-400 mt-auto">{formatDate(heroPost.createdAt)}</p>
            </div>
          </div>
        </Link>
      )}

      {/* --- グリッド --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {gridPosts.map((post) => (
          <Link
            key={post.id}
            href={getPostUrl(post)}
            className="group block bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-transform duration-200"
          >
            <Image
              src={extractThumbnail(post)}
              alt={post.title}
              width={500}
              height={280}
              className="w-full h-52 object-cover group-hover:opacity-90 transition"
              onError={onImageError}
            />
            <div className="p-6">
              <h2 className="text-lg font-bold text-[#192349] group-hover:underline line-clamp-2">
                {post.title}
              </h2>
              <div className="flex items-center gap-2 flex-wrap mt-2">
                {renderCategories(post.category)}
                {post.tags?.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-block bg-gray-200 text-xs text-gray-600 font-semibold px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-base text-gray-700 mt-2 line-clamp-3">{getSummary(post)}</p>
              <p className="text-xs text-gray-500 mt-2">{formatDate(post.createdAt)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

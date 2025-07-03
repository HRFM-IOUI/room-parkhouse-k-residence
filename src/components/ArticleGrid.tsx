"use client";
import Link from "next/link";
import Image from "next/image";

type Block = {
  type: "heading" | "text" | "image" | "video";
  content: string;
};
type Post = {
  id: string;
  title: string;
  createdAt: string | number | { seconds?: number };
  blocks?: Block[];
  image?: string;
  tags?: string[];
  category?: string;
};

type Props = {
  posts: Post[];
  isSearchResult?: boolean;
};

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

export default function ArticleGrid({ posts, isSearchResult = false }: Props) {
  if (!posts.length) return null;

  const useHeroCard = !isSearchResult && posts.length > 1;
  const heroPost: Post | null = useHeroCard ? posts[0] : null;
  const gridPosts: Post[] = useHeroCard ? posts.slice(1) : posts;

  const getImageSrc = (post: Post) => {
    const firstImage = post.blocks?.find((b) => b.type === "image" && b.content);
    const firstVideo = post.blocks?.find((b) => b.type === "video" && b.content);
    return (
      firstImage?.content ||
      post.image ||
      (firstVideo ? "/video-thumbnail.png" : undefined) ||
      "/phoc.png"
    );
  };

  const getSummary = (post: Post) => {
    const textBlock = post.blocks?.find((b) => b.type === "text" && b.content);
    if (!textBlock) return "";
    return textBlock.content.length > 80
      ? textBlock.content.slice(0, 80) + "..."
      : textBlock.content;
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Heroカード（検索中は非表示） */}
      {heroPost && (
        <Link href={`/posts/${heroPost.id}`}>
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl flex flex-col sm:flex-row overflow-hidden group hover:shadow-2xl transition-all duration-200">
            <div className="sm:w-1/2 w-full">
              <Image
                src={getImageSrc(heroPost)}
                alt={heroPost.title}
                width={600}
                height={320}
                className="w-full h-60 sm:h-[320px] object-cover group-hover:opacity-95 transition"
                priority
              />
            </div>
            <div className="sm:w-1/2 w-full flex flex-col justify-center p-6">
              <div className="mb-2">
                <span className="bg-[#e3e8fc] text-[#192349] text-xs font-bold px-3 py-1 rounded-full">
                  {heroPost.category
                    ? heroPost.category.charAt(0).toUpperCase() + heroPost.category.slice(1)
                    : "Uncategorized"}
                </span>
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

      {/* グリッド形式（検索中は全件） */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {gridPosts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="group block bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-transform duration-200"
          >
            <Image
              src={getImageSrc(post)}
              alt={post.title}
              width={500}
              height={280}
              className="w-full h-52 object-cover group-hover:opacity-90 transition"
            />
            <div className="p-6">
              <h2 className="text-lg font-bold text-[#192349] group-hover:underline line-clamp-2">
                {post.title}
              </h2>
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <span className="inline-block bg-[#e3e8fc] text-xs text-[#192349] font-semibold px-2 py-0.5 rounded-full">
                  {post.category
                    ? post.category.charAt(0).toUpperCase() + post.category.slice(1)
                    : "Uncategorized"}
                </span>
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

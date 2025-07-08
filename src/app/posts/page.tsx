"use client";
import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase";

import StickyBar from "@/components/StickyBar";
import SearchModal from "@/components/ActionsModal";
import HighlightHeroCard from "@/components/HighlightHeroCard";
import HighlightCarousel from "@/components/HighlightCarousel";
import CategorySidebar from "@/components/CategorySidebar";
import CategorySwiper from "@/components/CategorySwiper";
import ArticleGrid from "@/components/ArticleGrid";

// 英語配列
const CATEGORY_LIST = [
  "vision", "specs", "announcement", "usecase", "research",
  "culture", "technology", "education", "policy", "philosophy",
  "worldview", "uncategorized"
];

const CATEGORY_MAP: Record<string, string> = {
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
  highlight?: boolean;
};

export default function PostsPage() {
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(
          (doc: QueryDocumentSnapshot<DocumentData>): Post => {
            const data = doc.data();
            return {
              id: doc.id,
              title: typeof data.title === "string" ? data.title : "",
              createdAt: data.createdAt ?? "",
              blocks: Array.isArray(data.blocks)
                ? data.blocks
                    .filter(
                      (b: Block) =>
                        typeof b === "object" &&
                        b !== null &&
                        "type" in b &&
                        "content" in b &&
                        typeof b.type === "string" &&
                        typeof b.content === "string" &&
                        ["heading", "text", "image", "video"].includes(b.type)
                    )
                    .map((b: Block) => ({ type: b.type, content: b.content }))
                : [],
              image: typeof data.image === "string" ? data.image : undefined,
              tags: Array.isArray(data.tags)
                ? data.tags.filter((t: string) => typeof t === "string")
                : [],
              category:
                typeof data.category === "string"
                  ? data.category
                  : "uncategorized",
              highlight: !!data.highlight,
            };
          }
        );
        setPosts(fetched);
      } catch (err) {
        setError("データの取得に失敗しました。もう一度お試しください。");
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const highlightPosts = posts.filter((post) => post.highlight);
  const heroPost = highlightPosts[0] || null;
  const carouselHighlightPosts = highlightPosts.slice(1);

  const filteredPosts = posts
    .filter((post) => {
      const titleStr = typeof post.title === "string" ? post.title : "";
      const catStr = typeof post.category === "string" ? post.category : "";
      const matchTitle = titleStr.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = !selectedCategory || catStr === selectedCategory;
      const notHero = !heroPost || post.id !== heroPost.id;
      return matchTitle && matchCategory && notHero;
    })
    .slice(0, 4);

  return (
    <>
      <StickyBar />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setSearchOpen(false)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <main
        className="
          max-w-[1200px] w-full mx-auto
          px-2 sm:px-4 md:px-10 py-6 sm:py-10 md:py-12
          overflow-x-hidden
          bg-gradient-to-br from-[#fdfbf7] via-[#f5f4eb] to-[#e9e3cb]
          rounded-3xl shadow-2xl border border-[#ece2c1]/60
          min-h-[85vh]
        "
        style={{
          backdropFilter: "blur(9px)",
          boxShadow: "0 6px 48px 0 #ecd98b25, 0 1px 8px 0 #fffbe644",
        }}
      >
        <h2
          className="
            text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6 sm:mb-8 tracking-tight
            text-[#bfa14a] drop-shadow-lg
          "
          style={{
            fontFamily: '"Playfair Display", "Noto Serif JP", serif',
            letterSpacing: "0.04em",
            textShadow: "0 3px 18px #fffbe633, 0 0px 2px #ecd98b",
          }}
        >
          最新記事
        </h2>

        {loading && <p className="text-center text-gray-500 py-12">記事を読み込み中...</p>}
        {error && <p className="text-center text-red-500 py-12">{error}</p>}

        {!loading && !error && (
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 w-full">
            {/* サイドバー（PCのみ） */}
            <div className="
              hidden lg:block min-w-[200px] max-w-[260px] flex-shrink-0
              rounded-2xl bg-white/70 border border-[#ecd98b]/30 shadow
              backdrop-blur-md py-6 px-2
              sticky top-[92px]
              h-fit
            ">
              <CategorySidebar
                categories={CATEGORY_LIST}
                selected={selectedCategory}
                setSelected={setSelectedCategory}
                categoryMap={CATEGORY_MAP}
              />
            </div>

            {/* メインエリア */}
            <div className="w-full min-w-0 flex flex-col">
              <div className="lg:hidden mb-4 sm:mb-6 py-2">
                <CategorySwiper
                  categories={CATEGORY_LIST}
                  selected={selectedCategory}
                  setSelected={setSelectedCategory}
                  categoryMap={CATEGORY_MAP}
                />
              </div>

              {heroPost && (
                <section className="mb-6 sm:mb-8">
                  <HighlightHeroCard post={heroPost} />
                </section>
              )}

              <section>
                {filteredPosts.length === 0 ? (
                  <p className="text-center text-gray-400 py-12">該当する記事がありません。</p>
                ) : (
                  <ArticleGrid posts={filteredPosts} />
                )}
              </section>

              {carouselHighlightPosts.length > 0 && (
                <section className="mt-8 sm:mt-12">
                  <HighlightCarousel posts={carouselHighlightPosts} />
                </section>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

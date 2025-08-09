"use client";
import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  where,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase";

import StickyHeader from "@/components/StickyHeader";
import SearchModal from "@/components/ActionsModal";
import HighlightHeroCard from "@/components/HighlightHeroCard";
import HighlightCarousel from "@/components/HighlightCarousel";
import CategorySidebar from "@/components/CategorySidebar";
import CategorySwiper from "@/components/CategorySwiper";
import ArticleGrid from "@/components/ArticleGrid";

const CATEGORY_LIST = [
  "理事会", "検討委員会", "管理組合", "管理室", "地域情報",
  "暮らしと防災",
];

type Post = {
  id: string;
  title: string;
  createdAt: string | number | { seconds?: number };
  richtext: string;
  image?: string;
  tags?: string[];
  category?: string[];
  highlight?: boolean;
  slug?: string; 
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
      setError(null);

      try {
        const q = query(
          collection(db, "posts"),
          where("status", "==", "published"),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        const fetched: Post[] = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: typeof data.title === "string" ? data.title : "",
            createdAt: data.createdAt ?? "",
            richtext: typeof data.richtext === "string" ? data.richtext : "",
            image: typeof data.image === "string" ? data.image : undefined,
            tags: Array.isArray(data.tags) ? data.tags.filter((t: unknown) => typeof t === "string") : [],
            category: Array.isArray(data.category) ? data.category : [data.category].filter(Boolean),
            highlight: !!data.highlight,
            slug: typeof data.slug === "string" ? data.slug : "",
          };
        }).filter(p => !!p.richtext && p.richtext !== "<p></p>");
        setPosts(fetched);
      } catch (err) {
        // 型安全ガードでエラー処理！
        if (
          typeof err === "object" &&
          err !== null &&
          "message" in err &&
          typeof (err as { message: string }).message === "string"
        ) {
          const message = (err as { message: string }).message;
          if (message.includes("The query requires an index")) {
            const urlMatch = message.match(/https:\/\/console\.firebase\.google\.com\/[^\s"]+/);
            setError(
              "⚠️ Firestore複合インデックスが必要です。" +
              (urlMatch ? `\nインデックスを下記から作成してください：\n${urlMatch[0]}` : "") +
              "\nインデックス作成後、数分で自動反映されます。"
            );
          } else {
            setError("記事の取得に失敗しました。しばらく経ってから、もう一度お試しください。");
          }
          console.error("Error fetching posts:", err);
        } else {
          setError("記事の取得に失敗しました。しばらく経ってから、もう一度お試しください。");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // ハイライト記事の抽出
  const highlightPosts = posts.filter((post) => post.highlight);
  const heroPost = highlightPosts[0] || null;
  const carouselHighlightPosts = highlightPosts.slice(1);

  // 検索・カテゴリ絞り込み
  const filteredPosts = posts.filter((post) => {
    const titleStr = typeof post.title === "string" ? post.title : "";
    const matchTitle = titleStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      !selectedCategory ||
      (Array.isArray(post.category) && post.category.includes(selectedCategory));
    const notHero = !heroPost || post.id !== heroPost.id;
    return matchTitle && matchCategory && notHero;
  });

  return (
    <>
      {/* 固定ヘッダー */}
      <StickyHeader onSearchClick={() => setSearchOpen(true)} />

      {/* 検索モーダル */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setSearchOpen(false)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* メイン */}
      <main
        className="
          max-w-[1200px] w-full mx-auto px-4 sm:px-10 pt-14 pb-20
          bg-[#f8fafd]
        "
        style={{
          fontFamily: "'Noto Serif JP', '游明朝', serif",
        }}
        aria-label="最新記事"
      >
        <h2
          className="text-[2.1rem] md:text-[2.6rem] font-extrabold text-[#1e2433] mb-10 tracking-wide border-l-8 border-[#20305c] pl-4 bg-gradient-to-r from-[#fff] via-[#f2f4fb] to-[#fafdff]"
          style={{
            letterSpacing: "0.04em",
            fontFamily: "'Noto Serif JP', serif",
          }}
        >
          <span className="drop-shadow-md">最新記事</span>
          <br className="sm:hidden" />
          <span className="block text-lg mt-2 text-[#005099] font-medium font-sans tracking-wide"
                style={{ letterSpacing: "0.09em" }}>
            — 練馬区議会議員 池尻成二 公式 —
          </span>
        </h2>

        {loading && (
          <div className="text-center text-gray-400 py-16 text-base tracking-wider" aria-live="polite">
            記事を読み込んでいます…
          </div>
        )}
        {error && (
          <div className="text-center text-red-600 py-14 text-base font-medium tracking-wide whitespace-pre-line" aria-live="assertive" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="flex flex-col lg:flex-row gap-10 w-full">
            {/* サイドバー */}
            <aside className="hidden lg:block min-w-[210px] max-w-[240px]">
              <CategorySidebar
                categories={CATEGORY_LIST}
                selected={selectedCategory}
                setSelected={setSelectedCategory}
              />
            </aside>

            {/* メインカラム */}
            <section className="w-full min-w-0 flex flex-col">
              {/* モバイルカテゴリ */}
              <div className="lg:hidden mb-8">
                <CategorySwiper
                  categories={CATEGORY_LIST}
                  selected={selectedCategory}
                  setSelected={setSelectedCategory}
                />
              </div>

              {/* ピックアップ記事 */}
              {heroPost && (
                <section className="mb-10" aria-label="ピックアップ記事">
                  <HighlightHeroCard post={heroPost} />
                </section>
              )}

              {/* 記事グリッド */}
              <section aria-label="記事一覧">
                {filteredPosts.length === 0 ? (
                  <div className="text-center text-gray-400 py-14 text-base font-medium tracking-wide">
                    該当する記事は見つかりませんでした。
                  </div>
                ) : (
                  <ArticleGrid posts={filteredPosts} />
                )}
              </section>

              {/* 特集・おすすめ */}
              {carouselHighlightPosts.length > 0 && (
                <section className="mt-12" aria-label="特集・おすすめ記事">
                  <HighlightCarousel posts={carouselHighlightPosts} />
                </section>
              )}
            </section>
          </div>
        )}
      </main>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  addDoc,
  QueryDocumentSnapshot,
  DocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/firebase";
import ShareButtons from "@/components/ShareButtons";
import Head from "next/head";

type FirestoreTimestamp = { seconds: number; nanoseconds?: number };

type Post = {
  id: string;
  title: string;
  createdAt: string | number | FirestoreTimestamp;
  content: string;
  category?: string[];
  slug?: string;
  tags?: string[];
  description?: string;
};

type Comment = {
  text: string;
  createdAt: string | number | FirestoreTimestamp;
};

const SITE_TITLE = "池尻成二 公式ブログ";
const AUTHOR = "池尻成二";
const BASE_URL = "https://ikejiriseiji.jp";
const LOGO_URL = "https://ikejiriseiji.jp/eyecatch.jpg";
const TWITTER_SITE = "@iksesans";
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX"; // 差し替え必須

// Discover・AI強化用ワード
const MUST_HAVE_WORDS = ["練馬区議会", "池尻成二", "議会", "政策", "福祉", "公式", "地域"];

// 要約ロジック強化
function extractSummaryV2(html: string) {
  if (!html) return "";
  const txt = html
    .replace(/<\/(p|h[1-6]|li|br)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const sentences = txt.split(/[。！？!?\n]/).filter(Boolean);
  let summary = sentences.slice(0, 3).join("。").trim();
  if (summary.length > 100) {
    summary = summary.slice(0, 100).replace(/[。、.!?]$/, "") + "…";
  } else if (summary.length > 0 && !summary.endsWith("。")) {
    summary += "。";
  }
  return summary;
}

// 必須ワードをdescription等に追記
function enrichSummary(summary: string) {
  for (const word of MUST_HAVE_WORDS) {
    if (!summary.includes(word)) summary += ` ${word}`;
  }
  return summary.trim();
}

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const slugOrId = params?.slugOrId as string;

  const [post, setPost] = useState<Post | null>(null);
  const [prevPost, setPrevPost] = useState<Post | null>(null);
  const [nextPost, setNextPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ 公開記事のみ取得（dataの型安全化！）
  useEffect(() => {
    if (!slugOrId) return;
    setLoading(true);

    (async () => {
      let docSnap:
        | QueryDocumentSnapshot<DocumentData>
        | DocumentSnapshot<DocumentData>
        | null = null;

      // slug検索（published限定）
      const snap = await getDocs(
        query(
          collection(db, "posts"),
          where("slug", "==", slugOrId),
          where("status", "==", "published")
        )
      );
      if (!snap.empty) docSnap = snap.docs[0];

      // id検索（published限定）
      if (!docSnap) {
        const _docSnap = await getDoc(doc(db, "posts", slugOrId));
        if (_docSnap.exists() && _docSnap.data() && _docSnap.data()!.status === "published") {
          docSnap = _docSnap;
        }
      }

      if (docSnap) {
        const data = docSnap.data();
        if (!data) {
          setPost(null);
          setLoading(false);
          return;
        }
        setPost({
          id: docSnap.id,
          title: typeof data.title === "string" ? data.title : "",
          createdAt: data.createdAt ?? "",
          content: typeof data.richtext === "string" ? data.richtext : "",
          category: Array.isArray(data.category)
            ? data.category
            : [data.category].filter(Boolean),
          slug: data.slug ?? "",
          tags: Array.isArray(data.tags) ? data.tags : [],
          description:
            typeof data.description === "string"
              ? data.description
              : enrichSummary(extractSummaryV2(data.richtext || "")),
        });
      } else {
        setPost(null);
      }
      setLoading(false);
    })();
  }, [slugOrId]);

  // 前後記事・関連記事（publishedのみ）
  useEffect(() => {
    if (!slugOrId || !post) return;
    (async () => {
      const q = query(
        collection(db, "posts"),
        where("status", "==", "published"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const arr: Post[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: typeof data.title === "string" ? data.title : "",
          createdAt: data.createdAt ?? "",
          content: typeof data.richtext === "string" ? data.richtext : "",
          category: Array.isArray(data.category)
            ? data.category
            : [data.category].filter(Boolean),
          slug: data.slug ?? "",
          tags: Array.isArray(data.tags) ? data.tags : [],
        };
      });

      const idx = arr.findIndex(
        (item) => item.slug === slugOrId || item.id === slugOrId
      );
      setPrevPost(idx < arr.length - 1 ? arr[idx + 1] : null);
      setNextPost(idx > 0 ? arr[idx - 1] : null);

      // 関連記事
      const related = arr
        .filter(
          (item) =>
            (item.slug !== slugOrId && item.id !== slugOrId) &&
            Array.isArray(item.category) &&
            Array.isArray(post.category) &&
            item.category.some((cat) => post.category!.includes(cat))
        )
        .slice(0, 3);
      setRelatedPosts(related);
    })();
  }, [slugOrId, post]);

  // コメント一覧取得
  useEffect(() => {
    if (!post?.id) return;
    (async () => {
      const q = query(collection(db, "comments"), orderBy("createdAt", "asc"));
      const snapshot = await getDocs(q);
      setComments(
        snapshot.docs
          .filter((doc) => doc.data().postId === post.id)
          .map((doc) => ({
            text: doc.data().text ?? "",
            createdAt: doc.data().createdAt ?? "",
          }))
      );
    })();
  }, [post?.id]);

  // コメント投稿
  const addComment = async () => {
    if (!commentText.trim() || !post?.id) return;
    await addDoc(collection(db, "comments"), {
      postId: post.id,
      text: commentText,
      createdAt: new Date(),
    });
    setCommentText("");
    // 再取得
    const q = query(collection(db, "comments"), orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    setComments(
      snapshot.docs
        .filter((doc) => doc.data().postId === post.id)
        .map((doc) => ({
          text: doc.data().text ?? "",
          createdAt: doc.data().createdAt ?? "",
        }))
    );
  };

  // Firestore日付→表示用文字列
  function formatDate(dateVal: string | number | FirestoreTimestamp): string {
    try {
      let d: Date;
      if (
        typeof dateVal === "object" &&
        dateVal !== null &&
        "seconds" in dateVal &&
        typeof dateVal.seconds === "number"
      ) {
        d = new Date(dateVal.seconds * 1000);
      } else if (typeof dateVal === "string" || typeof dateVal === "number") {
        d = new Date(dateVal);
      } else {
        return "";
      }
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    } catch {
      return "";
    }
  }

  // OGP画像抽出
  function extractEyecatch(html: string) {
    const m = html.match(/<img[^>]+src=['"]([^'"]+)['"]/);
    return m?.[1] || "/eyecatch.jpg";
  }
  const eyecatch = post?.content ? extractEyecatch(post.content) : "/eyecatch.jpg";

  // SEO meta
  const metaTitle = post?.title ? `${post.title} | ${SITE_TITLE}` : "記事が見つかりません";
  const metaDesc = post?.description || "";
  const keywords = [
    ...(post?.tags || []),
    ...(post?.category || []),
    ...MUST_HAVE_WORDS,
  ].join(",");
  const canonicalUrl = post
    ? `${BASE_URL}/posts/${post.slug || post.id}`
    : `${BASE_URL}/posts/${slugOrId}`;
  const ogUrl =
    typeof window !== "undefined"
      ? window.location.href
      : canonicalUrl;
  const ogType = post ? "article" : "website";
  const publishedTime = post?.createdAt
    ? new Date(
        typeof post.createdAt === "object"
          ? (post.createdAt as FirestoreTimestamp).seconds * 1000
          : post.createdAt
      ).toISOString()
    : "";
  const modifiedTime = publishedTime; // updatedAt追加するなら差し替え

  // Discover・AI要約・構造化データ（JSON-LD最適化）
  const jsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        image: [eyecatch],
        datePublished: publishedTime,
        dateModified: modifiedTime,
        author: [{ "@type": "Person", name: AUTHOR }],
        publisher: {
          "@type": "NewsMediaOrganization",
          name: SITE_TITLE,
          url: BASE_URL,
          logo: { "@type": "ImageObject", url: LOGO_URL },
        },
        articleSection: post.category?.join(", ") || "",
        keywords: keywords,
        url: canonicalUrl,
        description: metaDesc,
        abstract: metaDesc,
        mainEntityOfPage: canonicalUrl,
        sameAs: ["https://twitter.com/iksesans"],
      }
    : null;

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <meta name="keywords" content={keywords} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={ogUrl} />
        <meta property="og:image" content={eyecatch} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content={SITE_TITLE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={TWITTER_SITE} />
        <meta name="twitter:creator" content={AUTHOR} />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDesc} />
        <meta name="twitter:image" content={eyecatch} />
        <meta name="author" content={AUTHOR} />
        <meta property="article:published_time" content={publishedTime} />
        <meta property="article:modified_time" content={modifiedTime} />
        <link rel="canonical" href={canonicalUrl} />
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
        {/* 404/非公開時はnoindex */}
        {!post && <meta name="robots" content="noindex" />}
        {/* Google Analytics GA4 */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname
              });
            `,
          }}
        />
      </Head>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-14 animate-fade-in-up">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline mb-6 text-sm sm:text-base"
        >
          ← 記事一覧に戻る
        </button>

        {loading && <p className="text-center text-gray-400">記事を読み込み中です...</p>}

        {!loading && !post && (
          <div className="bg-white rounded-xl p-12 text-center mt-12 shadow border">
            <h1 className="text-2xl font-bold text-red-500 mb-4">404 - 記事が見つかりません</h1>
            <p className="text-gray-600">
              指定された記事は公開されていないか、削除された可能性があります。
            </p>
            <button
              onClick={() => router.push("/posts")}
              className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              記事一覧に戻る
            </button>
          </div>
        )}

        {post && (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 border border-slate-100">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#192349] text-center drop-shadow-sm mb-2 leading-tight tracking-tight">
                {post.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 text-center">
                {formatDate(post.createdAt)}
              </p>
              {/* カテゴリ表示（複数対応） */}
              {Array.isArray(post.category) && post.category.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {post.category.map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <article className="article-content" style={{ marginTop: 24, marginBottom: 16 }}>
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>
            <div className="flex justify-center mt-8">
              <ShareButtons title={post.title} />
            </div>

            {/* タグ */}
            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 前後記事ナビ */}
            <div className="flex justify-between mt-10 mb-2">
              {prevPost ? (
                <button
                  onClick={() => router.push(getPostUrl(prevPost))}
                  className="text-blue-500 hover:underline"
                >
                  ← 前の記事：{prevPost.title}
                </button>
              ) : (
                <div />
              )}
              {nextPost ? (
                <button
                  onClick={() => router.push(getPostUrl(nextPost))}
                  className="text-blue-500 hover:underline"
                >
                  次の記事：{nextPost.title} →
                </button>
              ) : (
                <div />
              )}
            </div>

            {/* 関連記事 */}
            {relatedPosts.length > 0 && (
              <section className="mt-12 border-t pt-8">
                <h3 className="font-bold mb-2 text-lg">関連記事</h3>
                <ul>
                  {relatedPosts.map((rp) => (
                    <li key={rp.id} className="mb-2">
                      <button
                        className="text-blue-500 hover:underline"
                        onClick={() => router.push(getPostUrl(rp))}
                      >
                        {rp.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* コメント欄 */}
            <section className="mt-12 border-t pt-8">
              <h3 className="font-bold mb-2 text-lg">コメント</h3>
              <div className="mb-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="border p-2 w-full rounded"
                  rows={3}
                  placeholder="コメントを書く"
                />
                <button
                  onClick={addComment}
                  className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                >
                  投稿
                </button>
              </div>
              <div>
                {comments.length === 0 && <p>まだコメントはありません。</p>}
                {comments.map((c, i) => (
                  <div key={i} className="mb-2 p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-500">{formatDate(c.createdAt)}</span>
                    <div>{c.text}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </>
  );
}

// 投稿詳細URL
function getPostUrl(p: Post | null) {
  if (!p) return "#";
  return p.slug && p.slug.length > 0 ? `/posts/${p.slug}` : `/posts/${p.id}`;
}

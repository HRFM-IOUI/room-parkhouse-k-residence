"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ShareButtons from "@/components/ShareButtons";

// ブログデータの型定義
type Block = {
  type: "heading" | "text" | "image" | "video";
  content: string;
};

type PostData = {
  title: string;
  createdAt: string | number | { seconds?: number };
  blocks?: Block[];
};

// 日付フォーマット関数
function formatDate(dateVal: string | number | { seconds?: number }): string {
  try {
    let d: Date;
    if (
      typeof dateVal === "object" &&
      dateVal !== null &&
      "seconds" in dateVal &&
      typeof dateVal.seconds === "number"
    ) {
      d = new Date(dateVal.seconds * 1000);
    } else {
      d = new Date(dateVal as string | number);
    }
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return "";
  }
}

// Markdownのカスタムコンポーネント
const MarkdownComponents = {
  table: ({ node, ...props }: any) => (
    <div className="table-scroll overflow-x-auto">
      <table {...props} />
    </div>
  ),
  h2: ({ node, ...props }: any) => (
    <h2 className="text-xl sm:text-2xl font-bold text-[#192349] mt-8 mb-2 text-center" {...props} />
  ),
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.id as string;
  const [post, setPost] = useState<PostData | null>(null);

  // 投稿データの取得
  useEffect(() => {
    if (!postId) return;
    (async () => {
      const docRef = doc(db, "posts", postId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as PostData; // 型をPostDataとしてキャスト
        setPost({
          title: typeof data.title === "string" ? data.title : "",
          createdAt: data.createdAt ?? "",
          blocks: Array.isArray(data.blocks)
            ? data.blocks
                .filter(
                  (b: any) =>
                    typeof b === "object" &&
                    b !== null &&
                    "type" in b &&
                    "content" in b &&
                    typeof b.type === "string" &&
                    typeof b.content === "string" &&
                    ["heading", "text", "image", "video"].includes(b.type)
                )
                .map((b: any) => ({ type: b.type, content: b.content }))
            : [],
        });
      }
    })();
  }, [postId]);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-14 animate-fade-in-up">
      <button
        onClick={() => router.back()}
        className="text-blue-600 hover:underline mb-6 text-sm sm:text-base"
      >
        ← Back
      </button>

      {post ? (
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 space-y-7 border border-slate-100">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#192349] text-center drop-shadow-sm mb-2 leading-tight tracking-tight">
              {typeof post.title === "string" ? post.title : ""}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 text-center">
              {formatDate(post.createdAt)}
            </p>
            <div className="flex justify-center my-4">
              <ShareButtons title={typeof post.title === "string" ? post.title : ""} />
            </div>
          </div>
          <article className="space-y-6 text-gray-900 text-base leading-relaxed">
            {Array.isArray(post.blocks) &&
              post.blocks.map((block, idx) => {
                switch (block.type) {
                  case "heading":
                    return (
                      <h2
                        key={idx}
                        className="text-xl sm:text-2xl font-bold text-[#192349] text-center mt-8 mb-2"
                      >
                        {typeof block.content === "string" ? block.content : ""}
                      </h2>
                    );
                  case "text":
                    return (
                      <div
                        key={idx}
                        className="prose prose-slate max-w-none text-base prose-a:text-blue-600 prose-blockquote:border-blue-400"
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={MarkdownComponents}
                        >
                          {typeof block.content === "string" ? block.content : ""}
                        </ReactMarkdown>
                      </div>
                    );
                  case "image":
                    return (
                      <div key={idx} className="w-full flex justify-center my-6">
                        {typeof block.content === "string" && (
                          <Image
                            src={block.content}
                            alt={`image-${idx}`}
                            width={800}
                            height={480}
                            className="w-full max-w-2xl h-auto rounded-xl shadow-md border"
                            unoptimized
                          />
                        )}
                      </div>
                    );
                  case "video":
                    return (
                      <div key={idx} className="w-full flex justify-center my-6">
                        {typeof block.content === "string" && (
                          <video
                            src={block.content}
                            controls
                            className="w-full max-w-2xl rounded-xl shadow border"
                            style={{ background: "#000" }}
                          />
                        )}
                      </div>
                    );
                  default:
                    return null;
                }
              })}
          </article>
        </div>
      ) : (
        <p className="text-center text-gray-400">Loading article...</p>
      )}
    </main>
  );
}

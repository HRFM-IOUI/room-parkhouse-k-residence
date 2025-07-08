import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import PostDetailClient from "./PostDetailClient";

// 型定義
type Block = {
  type: "heading" | "text" | "image" | "video";
  content: string;
};

type PostData = {
  title: string;
  createdAt: string | number | { seconds?: number };
  blocks?: Block[];
  image?: string;
};

// 動的メタデータ生成
export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = params;
  let post: PostData | null = null;
  try {
    const docRef = doc(db, "posts", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      post = {
        title: typeof data.title === "string" ? data.title : "",
        createdAt: data.createdAt ?? "",
        blocks: Array.isArray(data.blocks)
          ? data.blocks.filter((b: Block) =>
              typeof b === "object" &&
              b !== null &&
              "type" in b &&
              "content" in b &&
              typeof b.type === "string" &&
              typeof b.content === "string" &&
              ["heading", "text", "image", "video"].includes(b.type)
            ).map((b: Block) => ({ type: b.type, content: b.content }))
          : [],
        image: typeof data.image === "string" ? data.image : undefined,
      };
    }
  } catch {}

  if (!post) {
    return {
      title: "記事が見つかりません - ザ・パークハウス上石神井レジデンス公式サイト",
      description: "指定された記事は存在しません。",
    };
  }

  const description =
    post.blocks?.find((b: Block) => b.type === "text")?.content?.slice(0, 70) || "記事詳細";

  return {
    title: `${post.title} | ザ・パークハウス上石神井レジデンス公式サイト`,
    description,
    openGraph: {
      title: `${post.title} | ザ・パークハウス上石神井レジデンス公式サイト`,
      description,
      images: [
        post.image
          ? { url: post.image, width: 800, height: 800, alt: post.title }
          : { url: "/phoc.png", width: 800, height: 800, alt: "公式ロゴ" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [post.image || "/phoc.png"],
    },
  };
}

// ここが型で必ずビルドが通る書き方（Page関数）
export default function PostDetailPage({ params }: { params: { id: string } }) {
  return <PostDetailClient postId={params.id} />;
}

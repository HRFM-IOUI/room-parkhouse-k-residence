// src/app/dashboard/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase";
import Loading from "@/components/Loading";

const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_ALLOWED_EMAIL || ""; // Vercel環境変数で設定

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (!loading) {
      if (!user || user.email !== ALLOWED_EMAIL) {
        router.replace("/login");
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <Loading />;
  }

  // 許可メールじゃなければ見せない
  if (user.email !== ALLOWED_EMAIL) {
    return <Loading />; // すぐに /login に飛ばす
  }

  return (
    <div
      className="antialiased bg-gray-50"
      style={{
        paddingTop: 0,
        minHeight: "100vh",
      }}
    >
      <main>{children}</main>
    </div>
  );
}

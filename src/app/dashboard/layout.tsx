// src/app/dashboard/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase";
import Loading from "@/components/Loading";

const ALLOWED_EMAILS = process.env.ALLOWED_EMAILS || ""; // Vercel環境変数で設定

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (!loading) {
      if (!user || user.email !== ALLOWED_EMAILS) {
        router.replace("/login");
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <Loading />;
  }

  // 許可メールじゃなければ見せない
  if (user.email !== ALLOWED_EMAILS) {
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

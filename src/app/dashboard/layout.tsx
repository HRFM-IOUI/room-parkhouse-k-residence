// src/app/dashboard/layout.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase";
import Loading from "@/components/Loading";

const ALLOWED_LIST = (process.env.NEXT_PUBLIC_ALLOWED_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

  const isAllowed = useMemo(() => {
    const email = user?.email?.toLowerCase() || "";
    return email && (ALLOWED_LIST.length === 0 || ALLOWED_LIST.includes(email));
  }, [user]);

  useEffect(() => {
    if (loading) return;
    if (!user || !isAllowed) {
      router.replace("/login");
    }
  }, [user, isAllowed, loading, router]);

  if (loading || !user) return <Loading />;
  if (!isAllowed) return <Loading />;

  return (
    <div className="antialiased bg-gray-50" style={{ paddingTop: 0, minHeight: "100vh" }}>
      <main>{children}</main>
    </div>
  );
}

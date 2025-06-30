"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCred.user.getIdToken();

      await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      router.push("/dashboard");
    } catch {
      setError("Login failed. Please check your email and password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e9efff] to-[#fdfcff] px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 space-y-6 border border-gray-300">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-[#192349]">ログイン</h1>
          <p className="text-sm text-gray-500 mt-2">今日もお疲れ様です！</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#192349] mb-1">ログインメールアドレス</label>
            <input
              type="email"
              value={email}
              autoComplete="username"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5b8dee] text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#192349] mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="●●●●●●●●"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5b8dee] text-gray-900"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#5b8dee] text-white font-semibold py-3 rounded-md hover:bg-[#456fc2] transition-all duration-300"
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
}

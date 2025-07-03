"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";

// ブランド用Serif
const brandFont = '"Playfair Display", "Noto Serif JP", serif';

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
      setError("メールアドレスまたはパスワードが正しくありません。");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f6eebd] via-[#fffbe6] to-[#e9efff] px-3">
      <div
        className="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-10 space-y-7 border border-[#ecd98b]/40 backdrop-blur-2xl"
        style={{
          boxShadow: "0 12px 44px 0 #ecd98b33, 0 2px 12px 0 #fffbe688",
        }}
      >
        <div className="text-center mb-4">
          <div
            className="mx-auto mb-4"
            style={{
              width: 64,
              height: 10,
              borderRadius: "10px",
              background: "linear-gradient(90deg,#fffbe6 0%,#ecd98b 80%,#fffbe6 100%)",
              marginBottom: "1.2rem",
            }}
          />
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{
              color: "#bfa14a",
              fontFamily: brandFont,
              letterSpacing: "0.05em",
              textShadow: "0 1px 10px #fffbe677, 0 0px 1.5px #ecd98b",
            }}
          >
            ログイン
          </h1>
          <p className="text-sm text-[#867531] font-medium mt-2" style={{ letterSpacing: "0.04em" }}>
            管理者専用ダッシュボードへ
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#bfa14a] mb-1" style={{ fontFamily: brandFont }}>
              ログインメールアドレス
            </label>
            <input
              type="email"
              value={email}
              autoComplete="username"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 border border-[#ecd98b] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ecd98b]/50 text-gray-900 bg-white/90 shadow"
              style={{ fontSize: "15.8px", fontWeight: 500 }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#bfa14a] mb-1" style={{ fontFamily: brandFont }}>
              パスワード
            </label>
            <input
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="●●●●●●●●"
              className="w-full px-4 py-2.5 border border-[#ecd98b] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ecd98b]/50 text-gray-900 bg-white/90 shadow"
              style={{ fontSize: "15.8px", fontWeight: 500 }}
            />
          </div>

          {error && (
            <p className="text-sm text-[#e13a17] mt-2 font-semibold px-2" style={{
              background: "rgba(252,228,199,0.35)",
              borderRadius: "7px",
              fontFamily: brandFont,
              letterSpacing: "0.02em"
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#fffbe6] via-[#ecd98b] to-[#d4af37] text-[#665c35] font-bold py-3 rounded-full shadow-lg hover:brightness-110 hover:scale-[1.02] transition-all border border-[#ecd98b]/50"
            style={{
              fontFamily: brandFont,
              letterSpacing: "0.03em",
              fontSize: "16.5px",
              boxShadow: "0 2px 8px #ecd98b44, 0 1px 4px #fffbe6aa",
            }}
          >
            ログイン
          </button>
        </form>

        {/* トップにもどる */}
        <button
          className="w-full mt-3 py-2 rounded-full bg-gradient-to-r from-white via-[#fffbe6]/60 to-[#ecd98b]/40 text-[#9b8940] font-semibold shadow hover:bg-[#f9eab5]/60 border border-[#ecd98b]/50 transition-all"
          style={{
            fontFamily: brandFont,
            fontSize: "15px",
            letterSpacing: "0.03em"
          }}
          onClick={() => router.push("/")}
        >
          トップにもどる
        </button>
      </div>
    </div>
  );
}

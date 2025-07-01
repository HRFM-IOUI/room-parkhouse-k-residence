"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://us-central1-roomphoc.cloudfunctions.net/api/send",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (data.success) {
        router.push("/contact/thanks"); // サンクスページに遷移
      } else {
        setError("送信に失敗しました。時間をおいて再度お試しください。");
      }
    } catch (err) {
      setError("送信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-[#f8f8f8] px-4">
      <div className="w-full max-w-lg bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-[#e8dab2] p-8">
        <h1 className="text-2xl font-bold text-[#bfa14a] mb-6">お問い合わせ</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-semibold text-[#192349]">お名前</label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-[#e8dab2] bg-white focus:outline-none focus:ring-2 focus:ring-[#bfa14a]"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-[#192349]">メールアドレス</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-[#e8dab2] bg-white focus:outline-none focus:ring-2 focus:ring-[#bfa14a]"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-[#192349]">メッセージ</label>
            <textarea
              name="message"
              required
              rows={5}
              value={form.message}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-[#e8dab2] bg-white focus:outline-none focus:ring-2 focus:ring-[#bfa14a]"
            />
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-full text-white font-bold transition-all
            ${loading ? "bg-[#bfa14a]/70" : "bg-gradient-to-r from-[#bfa14a] to-[#d4af37] hover:brightness-110"}
            shadow-md hover:scale-105 active:scale-100`}
          >
            {loading ? "送信中…" : "送信する"}
          </button>
        </form>
      </div>
    </div>
  );
}

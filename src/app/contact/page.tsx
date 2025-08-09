// src/app/contact/page.tsx
"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { FaMapMarkerAlt } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

type FormInputs = {
  type: "居住者からの連絡" | "区分所有者からの連絡" | "購入・入居検討" | "仲介・事業者" | "その他";
  resident: "居住者" | "非居住者";
  building?: string;
  room?: string;
  name: string;
  email: string;
  emailConfirm: string;
  message: string;
  agree: boolean;
  // HoneyPot
  company?: string;
};

// ====== ここだけ案件に合わせて調整 ======
const ADDRESS = "〒177-0044 東京都練馬区上石神井4-28-14";
const MAP_EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(
  ADDRESS
)}&hl=ja&z=16&output=embed`;
// ======================================

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    defaultValues: {
      type: "居住者からの連絡",
      resident: "居住者",
      agree: false,
    },
  });

  const emailValue = watch("email");
  const resident = watch("resident");

  const onSubmit = async (data: FormInputs) => {
    // HoneyPot：botは company に値を入れがち
    if (data.company) {
      toast.error("送信に失敗しました。もう一度お試しください。");
      return;
    }
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          receivedAt: new Date().toISOString(),
          site: "管理組合公式サイト",
        }),
        cache: "no-store",
      });
      if (!res.ok) throw new Error("送信失敗");
      reset();
      toast.success("送信が完了しました。ありがとうございました！");
    } catch {
      toast.error("送信に失敗しました。お手数ですが再度お試しください。");
    }
  };

  return (
    <div
      style={{
        background:
          "radial-gradient(1200px 600px at 50% -100px, #fff8e9 0%, #f5efdf 45%, #f2ecde 100%)",
        minHeight: "100vh",
        padding: "24px 0 64px",
      }}
    >
      <Toaster position="top-center" />

      {/* 見出し */}
      <div style={{ maxWidth: 1120, margin: "0 auto 18px", padding: "0 16px" }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "0.02em",
            color: "#5c4a16",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          管理組合へのお問い合わせ
        </h1>
        <div
          aria-hidden
          style={{
            height: 4,
            width: 160,
            margin: "0 auto",
            borderRadius: 999,
            background:
              "linear-gradient(90deg, #e7c76a 0%, #caa64b 45%, #e7c76a 100%)",
            boxShadow: "0 1px 0 #fff inset",
          }}
        />
      </div>

      <div
        style={{
          maxWidth: 1120,
          margin: "20px auto 0",
          padding: "0 16px",
          display: "flex",
          gap: 28,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        {/* 左：住所＋地図 */}
        <div style={{ flex: 1, minWidth: 360 }}>
          <div
            style={{
              background: "#ffffff",
              borderRadius: 18,
              padding: 22,
              boxShadow: "0 10px 30px rgba(160,140,80,0.15), 0 1px 0 #fff inset",
              border: "1px solid #efe5c8",
            }}
          >
            <div style={{ marginBottom: 10, color: "#6b5a1f" }}>
              <FaMapMarkerAlt
                style={{
                  color: "#caa64b",
                  marginRight: 10,
                  fontSize: 18,
                  verticalAlign: "text-top",
                }}
              />
              {ADDRESS}
            </div>
          </div>

          <div style={{ height: 16 }} />

          <div
            style={{
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(160,140,80,0.12), 0 1px 0 #fff inset",
              border: "1px solid #efe5c8",
              background: "#fff",
            }}
          >
            <iframe
              title="GoogleMap"
              src={MAP_EMBED_SRC}
              width="100%"
              height={320}
              style={{ border: 0, display: "block" }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* 右：フォーム */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{
            flex: 1,
            minWidth: 360,
            background: "#ffffff",
            borderRadius: 18,
            padding: "26px 24px 24px",
            boxShadow: "0 10px 30px rgba(160,140,80,0.15), 0 1px 0 #fff inset",
            border: "1px solid #efe5c8",
            color: "#3a3526",
          }}
        >
          <h2
            style={{
              fontWeight: 800,
              fontSize: 20,
              color: "#5c4a16",
              marginBottom: 16,
              letterSpacing: "0.02em",
            }}
          >
            お問い合わせフォーム
          </h2>

          {/* 種別 */}
          <Field label="お問い合わせ種別" required error={!!errors.type}>
            <select
              {...register("type", { required: true })}
              className="form-input"
            >
              <option value="居住者からの連絡">居住者からの連絡（設備・騒音・共用部など）</option>
              <option value="区分所有者からの連絡">区分所有者からの連絡（管理・各種届出など）</option>
              <option value="その他">その他</option>
            </select>
          </Field>

          {/* 居住者 判定 */}
          <Field label="居住者区分" required error={!!errors.resident}>
            <div style={{ display: "flex", gap: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="radio"
                  value="居住者"
                  {...register("resident", { required: true })}
                />
                居住者
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="radio"
                  value="非居住者"
                  {...register("resident", { required: true })}
                />
                非居住者・外部
              </label>
            </div>
          </Field>

          {/* 号室（居住者の時のみ任意表示） */}
          {resident === "居住者" && (
            <div style={{ display: "flex", gap: 12 }}>
              <Field label="棟（任意）">
                <input
                  {...register("building")}
                  className="form-input"
                  placeholder="例）南北棟 / 東西棟 など"
                />
              </Field>
              <Field label="号室（任意）">
                <input
                  {...register("room")}
                  className="form-input"
                  placeholder="例）000室"
                />
              </Field>
            </div>
          )}

          {/* 氏名 */}
          <Field label="お名前" required error={!!errors.name}>
            <input
              {...register("name", { required: true })}
              className="form-input"
              placeholder="お名前"
            />
          </Field>

          {/* 返信用メール */}
          <Field label="メールアドレス" required error={!!errors.email}>
            <input
              {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
              className="form-input"
              placeholder="Email"
              inputMode="email"
            />
          </Field>

          <Field
            label="確認のため再入力"
            required
            error={!!errors.emailConfirm}
            errorText={(errors.emailConfirm?.message as string) || "一致しません"}
          >
            <input
              {...register("emailConfirm", {
                required: true,
                validate: (v: string) => v === emailValue || "一致しません",
              })}
              className="form-input"
              placeholder="Email（確認用）"
              inputMode="email"
            />
          </Field>

          {/* 本文 */}
          <Field label="ご連絡内容" required error={!!errors.message}>
            <textarea
              {...register("message", { required: true })}
              rows={5}
              className="form-input"
              style={{ resize: "vertical" }}
              placeholder="内容をご記入ください（日時・場所・状況など）"
            />
          </Field>

          {/* 同意 */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center", color: "#5c4a16" }}>
              <input type="checkbox" {...register("agree", { required: true })} />
              個人情報の取り扱いに同意します（
              <a href="/privacy" style={{ color: "#8a6d24", textDecoration: "underline" }}>
                プライバシーポリシー
              </a>
              ）
            </label>
            {errors.agree && (
              <div style={{ color: "#b34141", fontSize: 13, marginTop: 4 }}>
                同意が必要です
              </div>
            )}
          </div>

          {/* HoneyPot（画面には見えない） */}
          <input
            tabIndex={-1}
            autoComplete="off"
            {...register("company")}
            style={{ position: "absolute", left: "-9999px", height: 0, width: 0 }}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 999,
              border: "1px solid #caa64b",
              background:
                "linear-gradient(90deg, #f2dc96 0%, #d7b458 45%, #efd67a 100%)",
              color: "#3a2e0f",
              fontWeight: 800,
              fontSize: 16,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              boxShadow: "0 8px 18px rgba(160,140,80,0.20), 0 1px 0 #fff inset",
              opacity: isSubmitting ? 0.8 : 1,
            }}
          >
            {isSubmitting ? "送信中…" : "送信する"}
          </button>

          <style>{`
            .form-input{
              width:100%;
              border:1px solid #e9dfc6;
              border-radius: 14px;
              padding: 12px 14px;
              font-size:16px;
              background:#fffdf6;
              transition: box-shadow .15s, border-color .15s, background .15s;
            }
            .form-input:focus{
              outline: none;
              border-color:#caa64b;
              box-shadow: 0 0 0 3px rgba(202,166,75,0.18);
              background:#ffffff;
            }
            label.req::after{
              content:" *";
              color:#c04444;
            }
            @media (max-width: 820px){
              iframe{ height:260px !important; }
            }
          `}</style>
        </form>
      </div>
    </div>
  );
}

/* 小さな共通ラッパ */
function Field({
  label,
  required,
  error,
  errorText,
  children,
}: {
  label: string;
  required?: boolean;
  error?: boolean;
  errorText?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16, flex: 1 }}>
      <label
        className={required ? "req" : undefined}
        style={{ display: "block", marginBottom: 6, color: "#5c4a16", fontWeight: 700 }}
      >
        {label}
      </label>
      {children}
      {error && (
        <div style={{ color: "#b34141", fontSize: 13, marginTop: 4 }}>
          {errorText || "必須項目です"}
        </div>
      )}
    </div>
  );
}

// src/app/privacy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

// ーーー 表示用の基本情報（ここを実データに置き換え） ーーー
const ORGANIZATION_NAME = "ザ・パークハウス上石神井レジデンス 管理組合";
const MANAGEMENT_COMPANY = "三菱地所コミュニティ";
const CONTACT_EMAIL = "info@example.com"; // フォーム優先（代替連絡先として保持）
const ESTABLISHED_AT = "2024年10月01日"; // 制定日（※年の桁に注意）
const UPDATED_AT = "2025年08月01日";     // 最終改定日

export const metadata: Metadata = {
  title: `プライバシーポリシー｜${ORGANIZATION_NAME}`,
  description:
    "マンション管理組合としての個人情報の取り扱いについて定めたプライバシーポリシーです。取得する情報、利用目的、安全管理措置、第三者提供、開示請求などを記載しています。",
};

export default function PrivacyPolicyPage() {
  return (
    <main
      id="main"
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(1400px 700px at 50% -160px, #fff8e9 0%, #f5efdf 45%, #f2ecde 100%)",
      }}
      aria-labelledby="pp-title"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 見出し */}
        <header className="mb-8 text-center">
          <h1
            id="pp-title"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight"
            style={{ color: "#3d3300", letterSpacing: ".02em" }}
          >
            プライバシーポリシー
          </h1>
          <p className="mt-2 text-sm opacity-80" style={{ color: "#6b5a1f" }}>
            制定日：{ESTABLISHED_AT}／最終改定日：{UPDATED_AT}
          </p>

          <div
            aria-hidden
            className="h-1 w-36 mx-auto rounded-full mt-5"
            style={{
              background:
                "linear-gradient(90deg, #e7c76a, #caa64b 45%, #e7c76a)",
              boxShadow: "0 1px 0 #fff inset",
            }}
          />
        </header>

        {/* カード本体 */}
        <article
          className="rounded-2xl bg-white shadow-xl"
          style={{
            border: "1px solid #efe5c8",
            boxShadow:
              "0 12px 28px rgba(160,140,80,0.14), 0 1px 0 #fff inset",
          }}
        >
          <div className="px-5 sm:px-8 py-7">
            {/* リード文 */}
            <p className="mb-6 leading-relaxed" style={{ color: "#3a3526" }}>
              {ORGANIZATION_NAME}
              （以下「当組合」といいます）は、居住者・関係者の皆さまの個人情報を適切に取り扱うため、以下のとおりプライバシーポリシー（個人情報保護方針）を定め、役員・関係者に周知徹底します。
            </p>

            {/* 目次 */}
            <nav
              className="mb-8 rounded-xl bg-[#fffdf6] px-4 py-4"
              style={{ border: "1px solid #efe5c8" }}
              aria-label="目次"
            >
              <ol className="list-decimal ml-5 space-y-1 text-sm" style={{ color: "#3a3526" }}>
                {[
                  "適用範囲",
                  "取得する情報",
                  "取得方法",
                  "利用目的",
                  "第三者提供",
                  "委託・共同利用",
                  "安全管理措置",
                  "国外への移転（クラウド利用）",
                  "Cookie等の利用",
                  "外部サービス",
                  "開示・訂正・利用停止等の請求",
                  "未成年の個人情報",
                  "保管期間",
                  "ポリシーの変更",
                  "お問い合わせ窓口",
                ].map((label, i) => (
                  <li key={i}>
                    <a
                      className="underline decoration-[#e7c76a] underline-offset-2 hover:opacity-80"
                      href={`#pp-${i + 1}`}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {/* セクション 1 */}
            <Section n={1} title="適用範囲">
              <p>
                本ポリシーは、当組合が管理するウェブサイト、掲示板、配布物、アンケート、各種申請手続き等を通じて取得する個人情報の取扱いに適用されます。管理会社等の外部事業者が独自に取得・管理する情報については、当該事業者の定める方針に従います。
              </p>
            </Section>

            {/* セクション 2 */}
            <Section n={2} title="取得する情報">
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  <strong>組合員・居住者情報：</strong>
                  氏名、住戸番号、連絡先（電話・メール）、世帯構成、車両情報、緊急連絡先 等
                </li>
                <li>
                  <strong>手続・申請・お問い合わせ情報：</strong>
                  申請内容、添付資料、問い合わせ内容、回答履歴 等
                </li>
                <li>
                  <strong>Web利用情報：</strong>
                  端末情報、アクセスログ、Cookie等の識別子、閲覧履歴 等
                </li>
                <li>
                  <strong>イベント・広報：</strong>
                  参加申込情報、撮影・掲載に関する同意情報 等
                </li>
              </ul>
            </Section>

            {/* セクション 3 */}
            <Section n={3} title="取得方法">
              <ul className="list-disc ml-6 space-y-2">
                <li>入居時・異動時の届出書、各種申請書の提出</li>
                <li>当組合ウェブサイト・フォーム・アンケートの入力</li>
                <li>理事会・総会・各委員会活動における記録・配布物の作成</li>
                <li>Cookie等によるアクセス解析（後記「Cookie等の利用」参照）</li>
              </ul>
            </Section>

            {/* セクション 4 */}
            <Section n={4} title="利用目的">
              <ul className="list-disc ml-6 space-y-2">
                <li>総会・理事会・各委員会等の運営、議案・資料の配布</li>
                <li>緊急時の安否確認・連絡、設備点検・工事等のお知らせ</li>
                <li>管理費等の請求・収納事務、駐車場・駐輪場等の契約管理</li>
                <li>防災・防犯、規約違反・苦情等への対応</li>
                <li>ウェブサイトの運営、品質向上、利用状況の把握</li>
              </ul>
            </Section>

            {/* セクション 5 */}
            <Section n={5} title="第三者提供">
              <p className="mb-2">
                次の場合を除き、本人の同意なく第三者へ提供することはありません。
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>法令に基づく場合、または官公庁等からの適法な照会がある場合</li>
                <li>人の生命・身体・財産の保護のために必要で、本人同意取得が困難な場合</li>
                <li>業務委託のために提供が必要な場合（後記「委託・共同利用」）</li>
              </ul>
            </Section>

            {/* セクション 6 */}
            <Section n={6} title="委託・共同利用">
              <p className="mb-2">
                当組合は、業務の一部を管理会社その他の事業者に委託することがあります。委託に際しては、秘密保持・再委託制限・安全管理等を契約で義務付け、適切に監督します。
              </p>
              <div className="rounded-xl bg-[#fffdf6] p-4" style={{ border: "1px solid #efe5c8" }}>
                <p className="font-bold mb-2" style={{ color: "#3d3300" }}>
                  共同利用
                </p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>
                    <strong>共同利用者：</strong>
                    {MANAGEMENT_COMPANY}（ほか、必要に応じて記載）
                  </li>
                  <li>
                    <strong>共同利用の目的：</strong>
                    建物維持管理、緊急対応、費用請求・収納、居住者対応 等
                  </li>
                  <li>
                    <strong>共同利用する項目：</strong>
                    氏名、住戸番号、連絡先、契約情報、申請内容 等
                  </li>
                  <li>
                    <strong>管理責任者：</strong>
                    {ORGANIZATION_NAME}
                  </li>
                </ul>
              </div>
            </Section>

            {/* セクション 7 */}
            <Section n={7} title="安全管理措置">
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  <strong>組織的：</strong>
                  取扱規程の策定、権限管理、点検・監査の実施
                </li>
                <li>
                  <strong>人的：</strong>
                  役員・委託先への守秘義務・教育、誓約取得
                </li>
                <li>
                  <strong>物理的：</strong>
                  書類・媒体の施錠保管、持出管理
                </li>
                <li>
                  <strong>技術的：</strong>
                  アクセス制御、通信の暗号化、ログ管理、二要素認証（可能な場合）
                </li>
              </ul>
            </Section>

            {/* セクション 8 */}
            <Section n={8} title="国外への移転（クラウド利用）">
              <p>
                当組合のウェブサイトやデータ管理には、国外にサーバを有するクラウドサービス（例：Google
                が提供する Firebase 等）を利用する場合があります。これらのサービス提供者に対しては、契約条項等により適切な安全管理措置が講じられるよう努めます。
              </p>
            </Section>

            {/* セクション 9 */}
            <Section n={9} title="Cookie等の利用">
              <p className="mb-2">
                本サイトでは、利便性向上や閲覧状況把握のために Cookie や類似技術を利用する場合があります。ブラウザ設定により Cookie
                を無効化できますが、一部機能が利用できない可能性があります。
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>アクセス解析（ページ閲覧数、滞在時間等）の取得</li>
                <li>ログイン状態や表示設定の保持（導入している場合）</li>
              </ul>
            </Section>

            {/* セクション 10 */}
            <Section n={10} title="外部サービス">
              <ul className="list-disc ml-6 space-y-2">
                <li>Firebase / Firestore（Google LLC）：サイト配信・データ保管 等</li>
                <li>（導入時）Google Analytics：アクセス解析</li>
                <li>その他、運営上必要なサービス（導入時に個別掲示）</li>
              </ul>
            </Section>

            {/* セクション 11 */}
            <Section n={11} title="開示・訂正・利用停止等の請求">
              <p className="mb-2">
                本人または正当な代理人から、保有個人データの開示・訂正・追加・削除・利用停止・第三者提供停止等の請求を受けた場合、法令に基づき速やかに対応します。
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>請求時は、ご本人確認のための書類提示をお願いする場合があります。</li>
                <li>回答までに一定期間を要することがあります。</li>
                <li>手数料は原則無料ですが、コピー代・郵送費等の実費をご負担いただく場合があります。</li>
              </ul>
            </Section>

            {/* セクション 12 */}
            <Section n={12} title="未成年の個人情報">
              <p>
                未成年の方の個人情報については、保護者の同意を得たうえで取得・利用するよう努めます。
              </p>
            </Section>

            {/* セクション 13 */}
            <Section n={13} title="保管期間">
              <p>
                目的達成に必要な範囲および関係法令・規約に従い、適切な期間保管します。不要となった情報は、遅滞なく安全な方法で消去または廃棄します。
              </p>
            </Section>

            {/* セクション 14 */}
            <Section n={14} title="ポリシーの変更">
              <p>
                本ポリシーの内容は、法令改正や運用実態の変更等に応じて、事前の告知なく改定されることがあります。重要な変更がある場合は、当組合サイト等でお知らせします。
              </p>
            </Section>

            {/* セクション 15 */}
            <Section n={15} title="お問い合わせ窓口">
              <p className="mb-2">
                本ポリシー、個人情報の取扱いに関するご質問・ご請求は、下記窓口へご連絡ください。
              </p>
              <ul className="list-disc ml-6">
                <li>組合名：{ORGANIZATION_NAME}</li>
                <li>管理会社：{MANAGEMENT_COMPANY}</li>
                <li>
                  お問い合わせ：
                  <Link
                    href="/contact"
                    className="underline decoration-[#e7c76a] underline-offset-2 font-semibold hover:opacity-80"
                    aria-label="お問い合わせフォームへ"
                  >
                    お問い合わせフォーム
                  </Link>
                </li>
                {/* 代替連絡先（必要なら活かしてください）
                <li>メール：{CONTACT_EMAIL}</li>
                */}
              </ul>

              {/* ▼ ゴールド調CTAボタン（フォームへ） */}
              <div className="mt-5">
                <Link
                  href="/contact"
                  className="inline-block rounded-full px-6 py-3 text-sm sm:text-base font-extrabold transition focus:outline-none focus-visible:ring-2"
                  style={{
                    color: "#3a2e0f",
                    border: "1px solid #caa64b",
                    background:
                      "linear-gradient(90deg, #f2dc96 0%, #d7b458 45%, #efd67a 100%)",
                    boxShadow:
                      "0 10px 24px rgba(160,140,80,0.18), 0 1px 0 #fff inset",
                  }}
                  aria-label="お問い合わせフォームを開く"
                >
                  お問い合わせはこちら
                </Link>
              </div>
            </Section>
          </div>
        </article>

        {/* 戻るリンク */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-block rounded-full px-5 py-2 text-sm font-semibold transition"
            style={{
              color: "#3a2e0f",
              border: "1px solid #caa64b",
              background:
                "linear-gradient(90deg, #f2dc96 0%, #d7b458 45%, #efd67a 100%)",
              boxShadow: "0 6px 14px rgba(160,140,80,0.18)",
            }}
          >
            トップへ戻る
          </a>
        </div>
      </div>
    </main>
  );
}

/** セクション見出し＋本文の共通レイアウト */
function Section({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={`pp-${n}`} className="mb-7 scroll-mt-24">
      <h2
        className="flex items-center gap-2 text-lg sm:text-xl font-extrabold mb-3"
        style={{ color: "#3d3300", letterSpacing: ".02em" }}
      >
        <span
          aria-hidden
          className="inline-block h-3 w-3 rounded-full"
          style={{
            background: "#caa64b",
            boxShadow: "0 0 0 4px rgba(202,166,75,0.18)",
          }}
        />
        {n}. {title}
      </h2>
      <div className="leading-relaxed" style={{ color: "#3a3526" }}>
        {children}
      </div>
    </section>
  );
}

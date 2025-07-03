import * as functions from "firebase-functions";
import nodemailer from "nodemailer";
import cors from "cors";
import express, { Request, Response } from "express";

// CORS設定
const app = express();
const allowedOrigin = 'https://www.the-parkhouse-kamishakujii-residence-official.site';

// CORS設定を追加（プリフライトリクエスト対応）
const corsOptions = {
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'OPTIONS'], // OPTIONSメソッドを許可
  allowedHeaders: ['Content-Type'], // 必要なヘッダーを設定
};

app.use(cors(corsOptions));  // CORSを設定
app.use(express.json());

// SMTP設定（Namecheap用）
const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",  // NamecheapのSMTPサーバー
  port: 587,  // ポート番号（TLS）
  secure: false,  // falseでTLS使用、trueでSSL使用
  auth: {
    user: process.env.SMTP_USER,  // 環境変数から取得
    pass: process.env.SMTP_PASS,  // 環境変数から取得
  },
});

// メール送信API
app.post("/send", async (req: Request, res: Response) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: "info@the-parkhouse-kamishakujii-residence-official.site",  // 送信元メールアドレス
    to: "info@the-parkhouse-kamishakujii-residence-official.site",    // 送信先メールアドレス
    subject: `【お問い合わせ】${name}様より`,  // メール件名
    html: `
      <p><strong>名前:</strong> ${name}</p>
      <p><strong>メール:</strong> ${email}</p>
      <p><strong>メッセージ:</strong><br/>${message}</p>
    `,  // メール本文
  };

  try {
    await transporter.sendMail(mailOptions);  // メール送信
    console.log("メール送信成功");
    res.status(200).send({ success: true });
  } catch (error) {
    console.error("メール送信エラー:", error);
    res.status(500).send({ success: false, error });
  }
});

// Firebase Functionsとして公開
export const api = functions
  .https.onRequest(app);  // リージョンはデフォルト（特に指定しない）

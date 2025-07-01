import * as functions from "firebase-functions";
import nodemailer from "nodemailer";
import cors from "cors";
import express, { Request, Response } from "express";

// CORS設定
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// SMTP設定（NamecheapやGmail）
const transporter = nodemailer.createTransport({
  host: "mail.the-parkhouse-kamishakujii-residence-official.site", // NamecheapのSMTP
  port: 465,
  secure: true,
  auth: {
    user: functions.config().smtp.user,
    pass: functions.config().smtp.pass,        // パスワード
  },
});

// メール送信API
app.post("/send", async (req: Request, res: Response) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: "contact@the-parkhouse-kamishakujii-residence-official.site",
    to: "contact@the-parkhouse-kamishakujii-residence-official.site",
    subject: `【お問い合わせ】${name}様より`,
    html: `
      <p><strong>名前:</strong> ${name}</p>
      <p><strong>メール:</strong> ${email}</p>
      <p><strong>メッセージ:</strong><br/>${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("メール送信成功");
    res.status(200).send({ success: true });
  } catch (error) {
    console.error("メール送信エラー:", error);
    res.status(500).send({ success: false, error });
  }
});

// Firebase Functionsとして公開
export const api = functions.https.onRequest(app);

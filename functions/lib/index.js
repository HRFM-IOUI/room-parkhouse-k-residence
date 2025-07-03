"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
// CORS設定
const app = (0, express_1.default)();
const allowedOrigin = 'https://www.the-parkhouse-kamishakujii-residence-official.site';
// CORS設定を追加（プリフライトリクエスト対応）
const corsOptions = {
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'OPTIONS'], // OPTIONSメソッドを許可
    allowedHeaders: ['Content-Type'], // 必要なヘッダーを設定
};
app.use((0, cors_1.default)(corsOptions)); // CORSを設定
app.use(express_1.default.json());
// SMTP設定（Namecheap用）
const transporter = nodemailer_1.default.createTransport({
    host: "mail.privateemail.com", // NamecheapのSMTPサーバー
    port: 587, // ポート番号（TLS）
    secure: false, // falseでTLS使用、trueでSSL使用
    auth: {
        user: functions.config().smtp.user, // Firebase設定から取得
        pass: functions.config().smtp.pass, // Firebase設定から取得
    },
});
// メール送信API
app.post("/send", async (req, res) => {
    const { name, email, message } = req.body;
    const mailOptions = {
        from: "info@the-parkhouse-kamishakujii-residence-official.site", // 送信元メールアドレス
        to: "info@the-parkhouse-kamishakujii-residence-official.site", // 送信先メールアドレス
        subject: `【お問い合わせ】${name}様より`, // メール件名
        html: `
      <p><strong>名前:</strong> ${name}</p>
      <p><strong>メール:</strong> ${email}</p>
      <p><strong>メッセージ:</strong><br/>${message}</p>
    `, // メール本文
    };
    try {
        await transporter.sendMail(mailOptions); // メール送信
        console.log("メール送信成功");
        res.status(200).send({ success: true });
    }
    catch (error) {
        console.error("メール送信エラー:", error);
        res.status(500).send({ success: false, error });
    }
});
// Firebase Functionsとして公開
exports.api = functions
    .https.onRequest(app); // リージョンはデフォルト（特に指定しない）
//# sourceMappingURL=index.js.map
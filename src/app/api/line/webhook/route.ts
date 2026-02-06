import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/knowledge";

// --- 環境変数 ---
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || "";
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const LIFF_URL = process.env.NEXT_PUBLIC_LIFF_ID
  ? `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}`
  : "";

// --- コマンドキーワード ---
const CMD_CONSULT = "相談する";
const CMD_AI_CONSULT = "AIへの相談";
const CMD_STAFF_CONSULT = "相談員への相談";
const CMD_OFFICE_INFO = "利用できる窓口のご紹介";
const CMD_END = "相談を終了する";

// --- LINE署名検証 ---
function verifySignature(body: string, signature: string): boolean {
  if (!LINE_CHANNEL_SECRET) return false;
  const hash = crypto
    .createHmac("SHA256", LINE_CHANNEL_SECRET)
    .update(body)
    .digest("base64");
  return hash === signature;
}

// --- LINE返信（テキスト） ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function replyToLine(replyToken: string, messages: any[]): Promise<void> {
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
}

// --- テキストメッセージ（クイックリプライ付き） ---
function textWithQuickReply(
  text: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: { label: string; text: string }[]
): any {
  return {
    type: "text",
    text,
    quickReply: {
      items: items.map((item) => ({
        type: "action",
        action: {
          type: "message",
          label: item.label,
          text: item.text,
        },
      })),
    },
  };
}

// --- 「相談する」選択メニュー ---
function consultMenu() {
  return textWithQuickReply(
    "ご希望の相談形式を選択してください。\n\n相談終了後、新たに相談を始めたい場合は、メニューから「相談する」を選択してください。",
    [
      { label: "AIへの相談", text: CMD_AI_CONSULT },
      { label: "相談員への相談", text: CMD_STAFF_CONSULT },
      { label: "窓口のご紹介", text: CMD_OFFICE_INFO },
    ]
  );
}

// --- AI相談モード開始メッセージ ---
function aiConsultGreeting() {
  return textWithQuickReply(
    "AIへの相談を開始します。\n\n介護や福祉制度のこと、今お困りのこと、何でもお気軽にご相談ください。\nお話を聞いて、次にやるべきことをご提案します。\n\n※AIによる回答です。詳しい個別相談は相談員にお繋ぎします。",
    [{ label: "相談を終了する", text: CMD_END }]
  );
}

// --- Claude AIで回答生成 ---
async function generateAIResponse(userMessage: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock ? textBlock.text : "申し訳ございません。回答を生成できませんでした。";
}

// --- AI回答をLINEメッセージ形式に（終了ボタン付き） ---
function aiResponseMessage(text: string) {
  // 5000文字制限対応
  const MAX_LEN = 4900;
  const messages = [];

  if (text.length <= MAX_LEN) {
    messages.push(
      textWithQuickReply(text, [
        { label: "相談を終了する", text: CMD_END },
      ])
    );
  } else {
    // 長文は分割。最後のメッセージにだけクイックリプライ
    let remaining = text;
    while (remaining.length > 0 && messages.length < 4) {
      messages.push({ type: "text", text: remaining.slice(0, MAX_LEN) });
      remaining = remaining.slice(MAX_LEN);
    }
    const last = remaining || messages.pop()?.text || "";
    messages.push(
      textWithQuickReply(last, [
        { label: "相談を終了する", text: CMD_END },
      ])
    );
  }

  return messages;
}

// --- LINE Webhook ハンドラー ---
interface LineEvent {
  type: string;
  replyToken?: string;
  source?: {
    userId?: string;
    type?: string;
  };
  message?: {
    type: string;
    text?: string;
  };
  postback?: {
    data?: string;
  };
}

interface LineWebhookBody {
  events: LineEvent[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-line-signature") || "";

    // 署名検証
    if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const parsed: LineWebhookBody = JSON.parse(body);

    // イベント処理
    for (const event of parsed.events) {
      if (event.type !== "message" || event.message?.type !== "text" || !event.replyToken) {
        continue;
      }

      const userText = (event.message.text || "").trim();

      // --- コマンド分岐 ---

      // 「相談する」→ 選択メニュー表示
      if (userText === CMD_CONSULT || userText === `[${CMD_CONSULT}]`) {
        await replyToLine(event.replyToken, [consultMenu()]);
        continue;
      }

      // 「AIへの相談」→ AI相談モード開始
      if (userText === CMD_AI_CONSULT) {
        await replyToLine(event.replyToken, [aiConsultGreeting()]);
        continue;
      }

      // 「相談員への相談」→ 案内メッセージ
      if (userText === CMD_STAFF_CONSULT) {
        await replyToLine(event.replyToken, [
          textWithQuickReply(
            "相談員への相談をご希望ですね。\n\n想ひ人の相談員が対応いたします。\n以下のLINEメッセージにご相談内容をお送りください。担当者よりご返信いたします。\n\n※対応時間外の場合は、翌営業日にご返信いたします。",
            [{ label: "メニューに戻る", text: CMD_CONSULT }]
          ),
        ]);
        continue;
      }

      // 「利用できる窓口のご紹介」→ 窓口情報
      if (userText === CMD_OFFICE_INFO) {
        const officeInfo = [
          "お住まいの地域で利用できる相談窓口をご紹介します。",
          "",
          "【地域包括支援センター】",
          "介護全般の無料相談窓口です。お住まいの市区町村に必ず設置されています。",
          "",
          "【市区町村の介護保険窓口】",
          "介護保険の申請・手続き全般を行えます。",
          "",
          "【医療ソーシャルワーカー（MSW）】",
          "入院中の方は、病院内のMSWに退院後の生活について相談できます。",
          "",
          LIFF_URL ? `詳しくはケアガイドでも確認できます。\n${LIFF_URL}` : "",
        ]
          .filter(Boolean)
          .join("\n");

        await replyToLine(event.replyToken, [
          textWithQuickReply(officeInfo, [
            { label: "AIに相談する", text: CMD_AI_CONSULT },
            { label: "メニューに戻る", text: CMD_CONSULT },
          ]),
        ]);
        continue;
      }

      // 「相談を終了する」→ 終了メッセージ
      if (userText === CMD_END) {
        await replyToLine(event.replyToken, [
          textWithQuickReply(
            "ご相談ありがとうございました。\nまたいつでもお気軽にご相談ください。\n\nメニューから「相談する」を選ぶと、いつでも相談を再開できます。",
            [{ label: "相談する", text: CMD_CONSULT }]
          ),
        ]);
        continue;
      }

      // --- 上記以外のテキスト → AI が回答 ---
      try {
        const aiReply = await generateAIResponse(userText);
        await replyToLine(event.replyToken, aiResponseMessage(aiReply));
      } catch (aiError) {
        console.error("AI response error:", aiError);
        await replyToLine(event.replyToken, [
          textWithQuickReply(
            "申し訳ございません。ただいま回答の生成に問題が発生しております。\nしばらくしてからもう一度お試しください。",
            [
              { label: "もう一度試す", text: userText.slice(0, 40) },
              { label: "メニューに戻る", text: CMD_CONSULT },
            ]
          ),
        ]);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// LINE Webhook URLの検証
export async function GET() {
  return NextResponse.json({ status: "LINE webhook is active" });
}

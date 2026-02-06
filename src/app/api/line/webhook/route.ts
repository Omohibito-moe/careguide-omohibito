import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/knowledge";

// --- 環境変数 ---
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || "";
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

// --- LINE署名検証 ---
function verifySignature(body: string, signature: string): boolean {
  if (!LINE_CHANNEL_SECRET) return false;
  const hash = crypto
    .createHmac("SHA256", LINE_CHANNEL_SECRET)
    .update(body)
    .digest("base64");
  return hash === signature;
}

// --- LINE返信 ---
async function replyToLine(replyToken: string, text: string): Promise<void> {
  // LINEメッセージは5000文字制限。超過分は分割して送信。
  const MAX_LEN = 4900;
  const messages: { type: "text"; text: string }[] = [];

  if (text.length <= MAX_LEN) {
    messages.push({ type: "text", text });
  } else {
    // 長文は複数メッセージに分割（最大5件）
    let remaining = text;
    while (remaining.length > 0 && messages.length < 5) {
      messages.push({ type: "text", text: remaining.slice(0, MAX_LEN) });
      remaining = remaining.slice(MAX_LEN);
    }
  }

  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
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

// --- LINE Webhook ハンドラー ---
interface LineEvent {
  type: string;
  replyToken?: string;
  message?: {
    type: string;
    text?: string;
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
      if (event.type === "message" && event.message?.type === "text" && event.replyToken) {
        const userText = event.message.text || "";
        try {
          const aiReply = await generateAIResponse(userText);
          await replyToLine(event.replyToken, aiReply);
        } catch (aiError) {
          console.error("AI response error:", aiError);
          await replyToLine(
            event.replyToken,
            "申し訳ございません。ただいま回答の生成に問題が発生しております。\nしばらくしてからもう一度お試しください。"
          );
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// LINE Webhook URLの検証（GETリクエスト）
export async function GET() {
  return NextResponse.json({ status: "LINE webhook is active" });
}

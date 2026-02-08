import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/knowledge";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface CaseContext {
  onsetType: string;
  phase: string;
  tasksCompleted: number;
  tasksTotal: number;
  priorityTasks: string[];
  detailedDiagnosis?: {
    careLevel?: string;
    medicalDependency?: string;
    dementiaLevel?: string;
    employmentStatus?: string;
    financialConcern?: string;
  } | null;
}

function formatCaseContext(context: CaseContext): string {
  let formatted = `■ ユーザーの現在の状況
発生タイプ: ${context.onsetType}
現在のフェーズ: ${context.phase}
タスク進捗: ${context.tasksCompleted}/${context.tasksTotal}件完了`;

  if (context.priorityTasks.length > 0) {
    formatted += `\n未完了の優先タスク: ${context.priorityTasks.join("、")}`;
  }

  if (context.detailedDiagnosis) {
    formatted += "\n\n■ 詳細情報";
    if (context.detailedDiagnosis.careLevel) {
      formatted += `\n要介護度: ${context.detailedDiagnosis.careLevel}`;
    }
    if (context.detailedDiagnosis.medicalDependency) {
      formatted += `\n医療依存度: ${context.detailedDiagnosis.medicalDependency}`;
    }
    if (context.detailedDiagnosis.dementiaLevel) {
      formatted += `\n認知症: ${context.detailedDiagnosis.dementiaLevel}`;
    }
    if (context.detailedDiagnosis.employmentStatus) {
      formatted += `\n就労状況: ${context.detailedDiagnosis.employmentStatus}`;
    }
    if (context.detailedDiagnosis.financialConcern) {
      formatted += `\n経済的不安: ${context.detailedDiagnosis.financialConcern}`;
    }
  }

  return formatted;
}

export async function POST(request: NextRequest) {
  try {
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const { messages, caseContext } = (await request.json()) as {
      messages: ChatMessage[];
      caseContext?: CaseContext | null;
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    // ケース情報があればシステムプロンプトに追加
    const systemPromptWithContext = caseContext
      ? `${SYSTEM_PROMPT}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n${formatCaseContext(caseContext)}\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n上記の状況を踏まえて、相談者に寄り添った具体的なアドバイスを提供してください。`
      : SYSTEM_PROMPT;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      system: systemPromptWithContext,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const reply = textBlock
      ? textBlock.text
      : "申し訳ございません。回答を生成できませんでした。";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

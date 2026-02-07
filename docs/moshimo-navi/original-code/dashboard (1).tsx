"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle, FileText, Book, CheckSquare } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Task {
  id: string
  title: string
  phase: string
  priority: "high" | "medium" | "low"
  status: "completed" | "pending" | "overdue"
  dueDate: string
  description: string
  template: string
  supportDocs?: string[]
  isKeyTask?: boolean
}

interface Phase {
  id: number
  name: string
  progress: number
  active: boolean
  period: string
  description?: string
}

interface SupportDoc {
  title: string
  url: string
}

interface Document {
  id: string
  title: string
  description: string
  type: "チェックリスト" | "ガイド" | "テンプレート"
  phase: "急性期病院" | "リハビリ病院" | "退院準備" | "在宅介護" | "共通" | "じわじわ型"
  url: string
}

const documents: Document[] = [
  {
    id: "72hours-checklist",
    title: "72時間チェックリスト",
    description: "入院後72時間以内に確認すべき重要事項のリスト",
    type: "チェックリスト",
    phase: "急性期病院",
    url: "https://example.com/docs/72hours-checklist.pdf"
  },
  {
    id: "high-cost-medical-care",
    title: "高額療養費ガイド",
    description: "高額療養費制度の仕組みと申請方法の解説",
    type: "ガイド",
    phase: "急性期病院",
    url: "https://example.com/docs/high-cost-medical-care.pdf"
  },
  {
    id: "doctor-questions",
    title: "医師に聞く質問テンプレ",
    description: "主治医に確認すべき重要事項のリスト",
    type: "テンプレート",
    phase: "急性期病院",
    url: "https://example.com/docs/doctor-questions.pdf"
  },
  {
    id: "company-report",
    title: "会社報告メール文例",
    description: "勤務先への連絡に使える文例集",
    type: "テンプレート",
    phase: "急性期病院",
    url: "https://example.com/docs/company-report.pdf"
  },
  {
    id: "family-meeting",
    title: "家族会議アジェンダ＆記録シート",
    description: "家族会議を効果的に進めるためのアジェンダと記録",
    type: "テンプレート",
    phase: "リハビリ病院",
    url: "https://example.com/docs/family-meeting.pdf"
  },
  {
    id: "housing-guide",
    title: "住まいを決めるための「選択ガイド」",
    description: "在宅か施設かの選択を検討する際のガイドライン",
    type: "ガイド",
    phase: "リハビリ病院",
    url: "https://example.com/docs/housing-guide.pdf"
  },
  {
    id: "care-insurance",
    title: "介護保険申請パック",
    description: "介護保険の申請に必要な書類と手続きの説明",
    type: "ガイド",
    phase: "リハビリ病院",
    url: "https://example.com/docs/care-insurance.pdf"
  },
  {
    id: "doctor-questions-advanced",
    title: "医師質問テンプレ（生活支援・医療行為入り）",
    description: "医療行為や生活支援に関する詳細な質問事項",
    type: "テンプレート",
    phase: "リハビリ病院",
    url: "https://example.com/docs/doctor-questions-advanced.pdf"
  },
  {
    id: "discharge-timeline",
    title: "退院までのTo-Doタイムライン",
    description: "退院に向けた準備事項を時系列で整理",
    type: "チェックリスト",
    phase: "退院準備",
    url: "https://example.com/docs/discharge-timeline.pdf"
  },
  {
    id: "transport-services",
    title: "搬送業者リスト",
    description: "信頼できる搬送業者の一覧と連絡先",
    type: "ガイド",
    phase: "退院準備",
    url: "https://example.com/docs/transport-services.pdf"
  },
  {
    id: "discharge-checklist",
    title: "退院準備チェックリスト",
    description: "退院時に必要な準備と確認事項",
    type: "チェックリスト",
    phase: "退院準備",
    url: "https://example.com/docs/discharge-checklist.pdf"
  },
  {
    id: "awareness-check",
    title: "気づきセルフチェック",
    description: "認知症の初期症状に気づくためのチェックリスト",
    type: "チェックリスト",
    phase: "じわじわ型",
    url: "https://example.com/docs/awareness-check.pdf"
  },
  {
    id: "community-support",
    title: "地域包括への相談手順",
    description: "地域包括支援センターへの相談方法と準備事項",
    type: "ガイド",
    phase: "じわじわ型",
    url: "https://example.com/docs/community-support.pdf"
  },
  {
    id: "asset-management",
    title: "財産管理ツール",
    description: "財産管理に必要な情報を記録するためのテンプレート",
    type: "テンプレート",
    phase: "じわじわ型",
    url: "https://example.com/docs/asset-management.pdf"
  }
]

export default function Dashboard({ 
  defaultTab = "flow",
  initialCareType,
  initialPhase = 1
}: { 
  defaultTab?: "flow" | "library";
  initialCareType?: "sudden" | "gradual";
  initialPhase?: number;
}) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [libraryTab, setLibraryTab] = useState<"いきなり型" | "じわじわ型" | "共通資料">("いきなり型")
  const [careType, setCareType] = useState<"sudden" | "gradual">(initialCareType || "sudden")
  const [selectedPhase, setSelectedPhase] = useState<number>(initialPhase)
  const [phases, setPhases] = useState<Phase[]>([
    { 
      id: 1, 
      name: "急性期病院", 
      progress: 0, 
      active: true, 
      period: "0-72時間〜2週間"
    },
    { 
      id: 2, 
      name: "リハビリ病院", 
      progress: 0, 
      active: true, 
      period: "2週間〜3ヶ月"
    },
    { 
      id: 3, 
      name: "退院準備カンファレンス", 
      progress: 0, 
      active: true, 
      period: "退院2-4週前"
    },
    { 
      id: 4, 
      name: "退院当日", 
      progress: 0, 
      active: true, 
      period: "退院日"
    },
    { 
      id: 5, 
      name: "在宅介護開始 or 施設入所", 
      progress: 0, 
      active: true, 
      period: "退院後0-1ヶ月"
    },
    { 
      id: 6, 
      name: "継続フォロー", 
      progress: 0, 
      active: true, 
      period: "以降"
    }
  ])

  const [gradualPhases, setGradualPhases] = useState<Phase[]>([
    {
      id: 0,
      name: "予兆・気づき期",
      progress: 0,
      active: true,
      period: "変化の気づき",
      description: "生活習慣の変化や認知機能の低下に気づく時期"
    },
    {
      id: 1,
      name: "受診・診断期",
      progress: 0,
      active: true,
      period: "1-2週間",
      description: "専門医の受診と診断を受ける時期"
    },
    {
      id: 2,
      name: "軽度在宅ケア期",
      progress: 0,
      active: true,
      period: "2-4週間",
      description: "介護保険申請とケアマネージャー選定"
    },
    {
      id: 3,
      name: "進行・備え期",
      progress: 0,
      active: true,
      period: "状態変化時",
      description: "今後の備えと財産管理の検討"
    },
    {
      id: 4,
      name: "中等度ケア期",
      progress: 0,
      active: true,
      period: "必要に応じて",
      description: "要介護度とケアプランの見直し"
    },
    {
      id: 5,
      name: "施設介護移行期",
      progress: 0,
      active: true,
      period: "1-2ヶ月",
      description: "施設の見学と入所手続き"
    }
  ])

  const updatePhaseProgress = (phaseId: number, progress: number) => {
    if (careType === "sudden") {
      setPhases(phases.map(phase => 
        phase.id === phaseId ? { ...phase, progress } : phase
      ))
    } else {
      setGradualPhases(gradualPhases.map(phase => 
        phase.id === phaseId ? { ...phase, progress } : phase
      ))
    }
  }

  const handleNavigateToSuddenLibrary = () => {
    setActiveTab("library")
    setLibraryTab("いきなり型")
  }

  const handleNavigateToGradualLibrary = () => {
    setActiveTab("library")
    setLibraryTab("じわじわ型")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">もしもナビ</h1>
      <p className="text-muted-foreground mb-6">介護の流れを管理し、やるべきことと相談先を一覧で確認できます</p>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "flow" | "library")}>
        <TabsList>
          <TabsTrigger value="flow">対応フロー</TabsTrigger>
          <TabsTrigger value="library">資料庫</TabsTrigger>
        </TabsList>

        <TabsContent value="flow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">介護の流れ</h2>
            <Tabs defaultValue={initialCareType || "sudden"} onValueChange={(value) => setCareType(value as "sudden" | "gradual")}>
              <TabsList>
                <TabsTrigger value="sudden">いきなり型</TabsTrigger>
                <TabsTrigger value="gradual">じわじわ型</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-4">
            {careType === "sudden" ? (
              <SuddenTypeTimeline 
                selectedPhase={selectedPhase} 
                onPhaseSelect={setSelectedPhase} 
                phases={phases}
                onUpdateProgress={updatePhaseProgress}
                onNavigateToLibrary={handleNavigateToSuddenLibrary}
              />
            ) : (
              <GradualTypeTimeline 
                selectedPhase={selectedPhase} 
                onPhaseSelect={setSelectedPhase}
                phases={gradualPhases}
                onUpdateProgress={updatePhaseProgress}
                onNavigateToLibrary={handleNavigateToGradualLibrary}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="library">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Input 
                type="search" 
                placeholder="資料を検索..." 
                className="max-w-sm"
              />
            </div>

            <Tabs value={libraryTab} onValueChange={(value) => setLibraryTab(value as "いきなり型" | "じわじわ型" | "共通資料")}>
              <TabsList>
                <TabsTrigger value="いきなり型">いきなり型</TabsTrigger>
                <TabsTrigger value="じわじわ型">じわじわ型</TabsTrigger>
                <TabsTrigger value="共通資料">共通資料</TabsTrigger>
              </TabsList>

              <TabsContent value="いきなり型" className="space-y-8">
                {/* 急性期病院 */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">急性期病院（0-72時間）</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {documents
                      .filter(doc => doc.phase === "急性期病院")
                      .map(document => (
                        <DocumentCard key={document.id} document={document} />
                      ))}
                  </div>
                </div>

                {/* リハビリ病院 */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">リハビリ病院（2週間〜3ヶ月）</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {documents
                      .filter(doc => doc.phase === "リハビリ病院")
                      .map(document => (
                        <DocumentCard key={document.id} document={document} />
                      ))}
                  </div>
                </div>

                {/* 退院準備 */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">退院準備</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {documents
                      .filter(doc => doc.phase === "退院準備")
                      .map(document => (
                        <DocumentCard key={document.id} document={document} />
                      ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="じわじわ型" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {documents
                    .filter(doc => doc.phase === "じわじわ型")
                    .map(document => (
                      <DocumentCard key={document.id} document={document} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="共通資料" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {documents
                    .filter(doc => doc.phase === "共通")
                    .map(document => (
                      <DocumentCard key={document.id} document={document} />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TaskCard({ task, onStatusChange }: { task: Task; onStatusChange?: (taskId: string, completed: boolean) => void }) {
  const priorityColors = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-orange-100 text-orange-800 border-orange-200",
    low: "bg-blue-100 text-blue-800 border-blue-200",
  }

  const statusIcons = {
    completed: <CheckCircle className="h-5 w-5 text-green-500" />,
    pending: <span className="h-5 w-5 rounded-full border border-orange-500" />,
    overdue: <span className="h-5 w-5 rounded-full bg-red-500" />,
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox 
            checked={task.status === "completed"} 
            className="mt-1"
            onCheckedChange={(checked) => onStatusChange?.(task.id, checked as boolean)}
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium flex items-center gap-2">
                  {task.title}
                  {task.isKeyTask && <span className="text-red-500 text-sm">🔑</span>}
                </h3>
                <div className="text-sm text-muted-foreground mt-1">{task.phase}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={priorityColors[task.priority]}>
                  {task.priority === "high" ? "優先" : task.priority === "medium" ? "標準" : "低"}
                </Badge>
                <span>{statusIcons[task.status]}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{task.dueDate}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function calculateProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0
  const completedTasks = tasks.filter(task => task.status === "completed").length
  return Math.round((completedTasks / tasks.length) * 100)
}

function createTask(task: Omit<Task, "status"> & { status?: Task["status"] }): Task {
  return {
    ...task,
    status: task.status || "pending"
  }
}

const initialSuddenTasks: Task[] = [
  createTask({
    id: "s1-1",
    title: "限度額適用認定証を窓口へ申請",
    phase: "急性期病院（0-72時間）",
    priority: "high",
    dueDate: "即時",
    description: "高額療養費の窓口負担を軽減するための認定証を申請します。",
    template: "限度額適用認定証の申請方法と必要書類",
    isKeyTask: true
  }),
  createTask({
    id: "s1-2",
    title: "保険証／服薬・検査情報を提出",
    phase: "急性期病院（0-72時間）",
    priority: "high",
    dueDate: "24時間以内",
    description: "入院時に必要な保険情報と既往歴の情報を病院に提出します。",
    template: "入院時提出書類チェックリスト"
  }),
  createTask({
    id: "s1-3",
    title: "医師から状況を確認",
    phase: "急性期病院（0-72時間）",
    priority: "high",
    dueDate: "48時間以内",
    description: "現在の状態と今後の見通しについて医師に確認します。",
    template: "医師への質問リスト"
  }),
  createTask({
    id: "s1-4",
    title: "会社への報告",
    phase: "急性期病院（0-72時間）",
    priority: "medium",
    dueDate: "72時間以内",
    description: "会社に状況を報告し、必要な手続きを確認します。",
    template: "会社報告テンプレート"
  }),
  createTask({
    id: "s2-1",
    title: "リハビリ病院の希望エリアを決定",
    phase: "リハビリ病院",
    priority: "high",
    dueDate: "入院1週間以内",
    description: "転院先となるリハビリ病院の希望エリアを家族で決めてMSWに伝えます。",
    template: "リハビリ病院選定チェックリスト",
    isKeyTask: true
  }),
  createTask({
    id: "s2-2",
    title: "介護保険の申請",
    phase: "リハビリ病院",
    priority: "high",
    dueDate: "入院2週間以内",
    description: "退院後の介護サービス利用に向けて介護保険を申請します。",
    template: "介護保険申請ガイド"
  }),
  createTask({
    id: "s2-3",
    title: "リハビリの目標設定",
    phase: "リハビリ病院",
    priority: "medium",
    dueDate: "転院後1週間以内",
    description: "リハビリの目標と期間について、医師とPT/OTと相談して決定します。",
    template: "リハビリ目標設定シート"
  }),
  createTask({
    id: "s3-1",
    title: "退院後の住まい方を決定",
    phase: "退院準備カンファレンス",
    priority: "high",
    dueDate: "退院1ヶ月前",
    description: "在宅か施設かの選択と、具体的な住まい方を決定します。",
    template: "住まい方検討シート",
    isKeyTask: true
  }),
  createTask({
    id: "s3-2",
    title: "退院日・搬送方法を確定",
    phase: "退院準備カンファレンス",
    priority: "high",
    dueDate: "退院1週間前",
    description: "退院日と搬送方法を確定し、必要な手配を行います。",
    template: "退院準備ガイド"
  }),
  createTask({
    id: "s3-3",
    title: "退院後のケアプラン作成",
    phase: "退院準備カンファレンス",
    priority: "high",
    dueDate: "退院2週間前",
    description: "ケアマネージャーと相談して退院後のケアプランを作成します。",
    template: "ケアプラン作成ガイド"
  }),
  createTask({
    id: "s4-1",
    title: "退院時の必要書類受け取り",
    phase: "退院当日",
    priority: "high",
    dueDate: "退院日",
    description: "診断書、リハビリ記録、服薬情報などの必要書類を受け取ります。",
    template: "退院時書類チェックリスト"
  }),
  createTask({
    id: "s5-1",
    title: "在宅サービスの利用開始",
    phase: "在宅介護開始",
    priority: "high",
    dueDate: "退院後1週間以内",
    description: "ケアプランに基づいて在宅サービスの利用を開始します。",
    template: "在宅サービス利用ガイド"
  })
]

const initialGradualTasks: Task[] = [
  createTask({
    id: "g0-1",
    title: "月1回の変化チェックリストを家族で共有",
    phase: "予兆・気づき期",
    priority: "medium",
    dueDate: "毎月末",
    description: "高齢者の状態変化を定期的に確認し、家族間で共有します。",
    template: "高齢者状態変化チェックリスト"
  }),
  createTask({
    id: "g0-2",
    title: "地域包括支援センターへ相談",
    phase: "予兆・気づき期",
    priority: "medium",
    dueDate: "変化に気づいたら",
    description: "地域の相談窓口に状況を伝え、初期段階でのアドバイスを受けます。",
    template: "地域包括支援センター相談ガイド"
  }),
  createTask({
    id: "g0-3",
    title: "かかりつけ医への相談",
    phase: "予兆・気づき期",
    priority: "medium",
    dueDate: "次回受診時",
    description: "気になる変化についてかかりつけ医に相談します。",
    template: "医師相談チェックリスト"
  }),
  createTask({
    id: "g1-1",
    title: "専門医の受診予約",
    phase: "受診・診断期",
    priority: "high",
    dueDate: "気づきから2週間以内",
    description: "認知症専門医の受診予約を取ります。",
    template: "専門医受診ガイド"
  }),
  createTask({
    id: "g1-2",
    title: "診断結果の確認と共有",
    phase: "受診・診断期",
    priority: "high",
    dueDate: "受診後1週間以内",
    description: "診断結果を家族間で共有し、今後の方針を話し合います。",
    template: "診断結果共有シート"
  }),
  createTask({
    id: "g2-1",
    title: "介護保険の申請",
    phase: "軽度在宅ケア期",
    priority: "high",
    dueDate: "診断後2週間以内",
    description: "介護保険の申請を行い、サービス利用の準備を始めます。",
    template: "介護保険申請ガイド"
  }),
  createTask({
    id: "g2-2",
    title: "ケアマネージャーの選定",
    phase: "軽度在宅ケア期",
    priority: "high",
    dueDate: "要介護認定後1週間以内",
    description: "担当のケアマネージャーを選び、初回面談を行います。",
    template: "ケアマネ選定チェックリスト"
  }),
  createTask({
    id: "g3-1",
    title: "財産管理方法の検討",
    phase: "進行・備え期",
    priority: "high",
    dueDate: "状態の変化を感じたら",
    description: "今後の財産管理方法について家族で話し合います。",
    template: "財産管理検討シート"
  }),
  createTask({
    id: "g3-2",
    title: "任意後見制度の検討",
    phase: "進行・備え期",
    priority: "medium",
    dueDate: "状態の変化を感じたら",
    description: "任意後見制度の利用について検討します。",
    template: "任意後見制度ガイド"
  }),
  createTask({
    id: "g4-1",
    title: "要介護度の見直し申請",
    phase: "中等度ケア期",
    priority: "high",
    dueDate: "状態変化から1週間以内",
    description: "状態の変化に応じて要介護度の見直しを申請します。",
    template: "要介護度見直しガイド"
  }),
  createTask({
    id: "g4-2",
    title: "ケアプランの見直し",
    phase: "中等度ケア期",
    priority: "high",
    dueDate: "要介護度変更後1週間以内",
    description: "新しい要介護度に応じてケアプランを見直します。",
    template: "ケアプラン見直しシート"
  }),
  createTask({
    id: "g5-1",
    title: "施設の見学と検討",
    phase: "施設介護移行",
    priority: "high",
    dueDate: "移行検討開始から1ヶ月以内",
    description: "複数の介護施設を見学し、検討します。",
    template: "施設見学チェックリスト"
  }),
  createTask({
    id: "g5-2",
    title: "施設入所の申込み",
    phase: "施設介護移行",
    priority: "high",
    dueDate: "施設決定後1週間以内",
    description: "選定した施設への入所申込みを行います。",
    template: "施設入所申込みガイド"
  })
]

function SuddenTypeTasks({ 
  selectedPhase,
  onUpdateProgress,
  onNavigateToLibrary
}: { 
  selectedPhase: number;
  onUpdateProgress: (progress: number) => void;
  onNavigateToLibrary: () => void;
}) {
  const [tasks, setTasks] = useState<Task[]>(initialSuddenTasks)

  const handleStatusChange = (taskId: string, completed: boolean) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: completed ? "completed" as const : "pending" as const }
        : task
    )
    setTasks(updatedTasks)
  }

  const currentPhaseTasks = useMemo(() => tasks.filter(task => {
    switch (selectedPhase) {
      case 1:
        return task.phase.includes("急性期病院")
      case 2:
        return task.phase.includes("リハビリ病院")
      case 3:
        return task.phase.includes("退院準備カンファレンス")
      case 4:
        return task.phase.includes("退院当日")
      case 5:
        return task.phase.includes("在宅介護開始") || task.phase.includes("施設入所")
      case 6:
        return task.phase.includes("継続フォロー")
      default:
        return false
    }
  }), [tasks, selectedPhase])

  useEffect(() => {
    const progress = calculateProgress(currentPhaseTasks)
    onUpdateProgress(progress)
  }, [currentPhaseTasks])

  const getSupportDocsForPhase = (phase: number): SupportDoc[] => {
    switch (phase) {
      case 1:
        return documents
          .filter(doc => doc.phase === "急性期病院")
          .map(doc => ({
            title: doc.title,
            url: doc.url
          }))
      case 2:
        return documents
          .filter(doc => doc.phase === "リハビリ病院")
          .map(doc => ({
            title: doc.title,
            url: doc.url
          }))
      case 3:
        return documents
          .filter(doc => doc.phase === "退院準備")
          .map(doc => ({
            title: doc.title,
            url: doc.url
          }))
      default:
        return []
    }
  }

  const currentPhaseSupportDocs = getSupportDocsForPhase(selectedPhase)

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {currentPhaseTasks.map((task) => (
          <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
        ))}
      </div>
      {currentPhaseSupportDocs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">参考資料</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentPhaseSupportDocs.map((doc, index) => (
                <li key={index}>
                  <button
                    onClick={onNavigateToLibrary}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary hover:underline w-full text-left"
                  >
                    <FileText className="h-4 w-4 text-purple-500" />
                    {doc.title}
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function GradualTypeTasks({ 
  selectedPhase,
  onUpdateProgress,
  onNavigateToLibrary
}: { 
  selectedPhase: number;
  onUpdateProgress: (progress: number) => void;
  onNavigateToLibrary: () => void;
}) {
  const [tasks, setTasks] = useState<Task[]>(initialGradualTasks)

  const handleStatusChange = (taskId: string, completed: boolean) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: completed ? "completed" as const : "pending" as const }
        : task
    )
    setTasks(updatedTasks)
  }

  const currentPhaseTasks = useMemo(() => tasks.filter(task => {
    switch (selectedPhase) {
      case 0:
        return task.phase === "予兆・気づき期"
      case 1:
        return task.phase === "受診・診断期"
      case 2:
        return task.phase === "軽度在宅ケア期"
      case 3:
        return task.phase === "進行・備え期"
      case 4:
        return task.phase === "中等度ケア期"
      case 5:
        return task.phase === "施設介護移行"
      default:
        return false
    }
  }), [tasks, selectedPhase])

  useEffect(() => {
    const progress = calculateProgress(currentPhaseTasks)
    onUpdateProgress(progress)
  }, [currentPhaseTasks])

  const getSupportDocsForPhase = (phase: number): SupportDoc[] => {
    switch (phase) {
      case 0:
        return [
          { 
            title: "気づきセルフチェック", 
            url: "https://example.com/docs/awareness-check.pdf"
          },
          { 
            title: "地域包括への相談手順", 
            url: "https://example.com/docs/community-support.pdf"
          },
          { 
            title: "財産管理ツール（家計・資産一覧テンプレ）", 
            url: "https://example.com/docs/asset-management.pdf"
          }
        ]
      case 1:
        return [
          { 
            title: "専門医受診ガイド", 
            url: "https://example.com/docs/specialist-visit.pdf"
          },
          { 
            title: "診断結果共有シート", 
            url: "https://example.com/docs/diagnosis-sharing.pdf"
          }
        ]
      case 2:
        return [
          { 
            title: "介護保険申請ガイド", 
            url: "https://example.com/docs/care-insurance.pdf"
          },
          { 
            title: "ケアマネ選定チェックリスト", 
            url: "https://example.com/docs/care-manager.pdf"
          }
        ]
      case 3:
        return [
          { 
            title: "財産管理検討シート", 
            url: "https://example.com/docs/asset-management.pdf"
          },
          { 
            title: "任意後見制度ガイド", 
            url: "https://example.com/docs/voluntary-guardianship.pdf"
          }
        ]
      case 4:
        return [
          { 
            title: "要介護度見直しガイド", 
            url: "https://example.com/docs/care-level-review.pdf"
          },
          { 
            title: "ケアプラン見直しシート", 
            url: "https://example.com/docs/care-plan-review.pdf"
          }
        ]
      case 5:
        return [
          { 
            title: "施設見学チェックリスト", 
            url: "https://example.com/docs/facility-visit.pdf"
          },
          { 
            title: "施設入所申込みガイド", 
            url: "https://example.com/docs/facility-admission.pdf"
          }
        ]
      default:
        return []
    }
  }

  const currentPhaseSupportDocs = getSupportDocsForPhase(selectedPhase)

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {currentPhaseTasks.map((task) => (
          <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
        ))}
      </div>
      {currentPhaseSupportDocs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">参考資料</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentPhaseSupportDocs.map((doc, index) => (
                <li key={index}>
                  <button
                    onClick={onNavigateToLibrary}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary hover:underline w-full text-left"
                  >
                    <FileText className="h-4 w-4 text-purple-500" />
                    {doc.title}
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SuddenTypeTimeline({ 
  selectedPhase, 
  onPhaseSelect,
  phases,
  onUpdateProgress,
  onNavigateToLibrary
}: { 
  selectedPhase: number; 
  onPhaseSelect: (phaseId: number) => void;
  phases: Phase[];
  onUpdateProgress: (phaseId: number, progress: number) => void;
  onNavigateToLibrary: () => void;
}) {
  return (
    <div className="space-y-4">
      {phases.map((phase) => (
        <div key={phase.id} className="space-y-4">
          <Card 
            className={`cursor-pointer hover:shadow-md transition-shadow ${selectedPhase === phase.id ? "border-primary shadow-lg" : "opacity-70"}`}
            onClick={() => onPhaseSelect(phase.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">{phase.name}</CardTitle>
                <span className="text-sm text-muted-foreground">{phase.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>進捗</span>
                  <span>{phase.progress}%</span>
                </div>
                <Progress value={phase.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* 選択されているフェーズの場合のみタスクを表示 */}
          {selectedPhase === phase.id && (
            <Card>
              <CardHeader>
                <CardTitle>やるべきことと参考資料</CardTitle>
                <CardDescription>現在のフェーズで優先すべきタスクと参考資料</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SuddenTypeTasks 
                  selectedPhase={selectedPhase}
                  onUpdateProgress={(progress) => onUpdateProgress(selectedPhase, progress)}
                  onNavigateToLibrary={onNavigateToLibrary}
                />
              </CardContent>
            </Card>
          )}
        </div>
      ))}
    </div>
  )
}

function GradualTypeTimeline({ 
  selectedPhase, 
  onPhaseSelect,
  phases,
  onUpdateProgress,
  onNavigateToLibrary
}: { 
  selectedPhase: number; 
  onPhaseSelect: (phaseId: number) => void;
  phases: Phase[];
  onUpdateProgress: (phaseId: number, progress: number) => void;
  onNavigateToLibrary: () => void;
}) {
  return (
    <div className="space-y-4">
      {phases.map((phase) => (
        <div key={phase.id} className="space-y-4">
          <Card 
            className={`cursor-pointer hover:shadow-md transition-shadow ${selectedPhase === phase.id ? "border-primary shadow-lg" : "opacity-70"}`}
            onClick={() => onPhaseSelect(phase.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base">{phase.name}</CardTitle>
                  {phase.description && (
                    <p className="text-sm text-muted-foreground">{phase.description}</p>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">{phase.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>進捗</span>
                  <span>{phase.progress}%</span>
                </div>
                <Progress value={phase.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* 選択されているフェーズの場合のみタスクを表示 */}
          {selectedPhase === phase.id && (
            <Card>
              <CardHeader>
                <CardTitle>やるべきことと参考資料</CardTitle>
                <CardDescription>現在のフェーズで優先すべきタスクと参考資料</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <GradualTypeTasks 
                  selectedPhase={selectedPhase}
                  onUpdateProgress={(progress) => onUpdateProgress(selectedPhase, progress)}
                  onNavigateToLibrary={onNavigateToLibrary}
                />
              </CardContent>
            </Card>
          )}
        </div>
      ))}
    </div>
  )
}

function DocumentCard({ document }: { document: Document }) {
  const icons = {
    "チェックリスト": <CheckSquare className="h-4 w-4 text-green-500" />,
    "ガイド": <Book className="h-4 w-4 text-blue-500" />,
    "テンプレート": <FileText className="h-4 w-4 text-purple-500" />
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {icons[document.type]}
          <div>
            <h3 className="font-medium">{document.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{document.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-1 bg-secondary rounded-full">{document.type}</span>
              <span className="text-xs px-2 py-1 bg-secondary rounded-full">{document.phase}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

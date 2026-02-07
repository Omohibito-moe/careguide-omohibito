"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, FileText, Star, Download } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function ResourceLibrary() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">資料庫</h2>
      </div>

      <div className="relative mb-6">
        <Input
          placeholder="資料を検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs defaultValue="sudden">
        <TabsList className="w-full max-w-md grid grid-cols-3">
          <TabsTrigger value="sudden">いきなり型</TabsTrigger>
          <TabsTrigger value="gradual">じわじわ型</TabsTrigger>
          <TabsTrigger value="general">共通資料</TabsTrigger>
        </TabsList>

        <TabsContent value="sudden" className="mt-6">
          <h3 className="text-lg font-medium mb-4">急性期病院（0-72時間）</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <ResourceCard
              title="「72時間チェックリスト」"
              description="入院直後に確認すべき重要事項のリスト"
              type="checklist"
              phase="急性期病院"
            />
            <ResourceCard
              title="高額療養費ガイド"
              description="高額療養費制度の仕組みと申請方法の解説"
              type="guide"
              phase="急性期病院"
            />
            <ResourceCard
              title="医師に聞く質問テンプレ"
              description="主治医に確認すべき重要事項のリスト"
              type="template"
              phase="急性期病院"
            />
            <ResourceCard
              title="会社報告メール文例"
              description="勤務先への連絡に使える文例集"
              type="template"
              phase="急性期病院"
            />
          </div>

          <h3 className="text-lg font-medium mb-4">急性期病院（3日-2週）</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <ResourceCard
              title="家族会議アジェンダ＆記録シート"
              description="家族間での話し合いを効率的に進めるためのフォーマット"
              type="template"
              phase="急性期病院"
            />
            <ResourceCard
              title="住まいを決めるための「選択ガイド」"
              description="退院後の住まい選択をサポートする意思決定ツール"
              type="guide"
              phase="急性期病院"
            />
            <ResourceCard
              title="介護保険申請パック"
              description="介護保険申請に必要な書類と手続きの解説"
              type="document"
              phase="急性期病院"
            />
            <ResourceCard
              title="医師質問テンプレ（生活支援・医療行為入り）"
              description="退院後の生活に必要な医療・介護サポートについて医師に確認すべき事項"
              type="template"
              phase="急性期病院"
            />
          </div>

          <h3 className="text-lg font-medium mb-4">リハビリ病院（回復期）</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <ResourceCard
              title="住まい決定シート（チェック式）"
              description="退院先の最終決定をサポートするチェックリスト"
              type="checklist"
              phase="リハビリ病院"
            />
            <ResourceCard
              title="施設見学チェックリスト＋費用早見表"
              description="施設見学時のチェックポイントと費用比較表"
              type="checklist"
              phase="リハビリ病院"
            />
            <ResourceCard
              title="ケアマネ選び＆プラン確認ガイド"
              description="ケアマネージャーの選定方法とケアプラン確認のポイント"
              type="guide"
              phase="リハビリ病院"
            />
            <ResourceCard
              title="リハ医質問テンプレ（退院後生活に必要な支援）"
              description="リハビリ医に確認すべき退院後の生活支援に関する質問リスト"
              type="template"
              phase="リハビリ病院"
            />
          </div>

          <h3 className="text-lg font-medium mb-4">退院準備〜退院後</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ResourceCard
              title="「退院までのTo-Doタイムライン」"
              description="退院までの準備事項を時系列で整理したチェックリスト"
              type="checklist"
              phase="退院準備"
            />
            <ResourceCard
              title="「退院受け取りチェックリスト」"
              description="退院時に受け取るべき書類や説明事項のリスト"
              type="checklist"
              phase="退院当日"
            />
            <ResourceCard
              title="家計ダッシュボード（医療＋介護費）"
              description="医療費と介護費を一元管理するための家計簿テンプレート"
              type="tool"
              phase="在宅/施設"
            />
            <ResourceCard
              title="３か月後：状態／負担セルフチェック"
              description="退院後3ヶ月時点での状態と介護負担を確認するチェックリスト"
              type="checklist"
              phase="在宅/施設"
            />
          </div>
        </TabsContent>

        <TabsContent value="gradual" className="mt-6">
          <h3 className="text-lg font-medium mb-4">予兆・気づき期</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <ResourceCard
              title={'"気づき"セルフチェック'}
              description="認知症や身体機能低下の初期症状チェックリスト"
              type="checklist"
              phase="予兆・気づき期"
            />
            <ResourceCard
              title="地域包括への相談手順"
              description="地域包括支援センターへの相談方法と準備すべきこと"
              type="guide"
              phase="予兆・気づき期"
            />
            <ResourceCard
              title="財産管理ツール（家計・資産一覧テンプレ）"
              description="親の資産状況を把握するための一覧表"
              type="tool"
              phase="予兆・気づき期"
            />
          </div>

          <h3 className="text-lg font-medium mb-4">受診・診断期〜軽度在宅ケア期</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <ResourceCard
              title="医師に聞く質問テンプレ（病状・介助量・在宅可否）"
              description="診断時に医師に確認すべき事項のリスト"
              type="template"
              phase="受診・診断期"
            />
            <ResourceCard
              title="介護保険 説明ガイド"
              description="介護保険制度の概要と申請方法の解説"
              type="guide"
              phase="受診・診断期"
            />
            <ResourceCard
              title="介護保険オンライン申請サポート"
              description="介護保険のオンライン申請方法の手順解説"
              type="guide"
              phase="軽度在宅ケア期"
            />
            <ResourceCard
              title="社協ヘルパーの利用方法＆料金早見表"
              description="社会福祉協議会のヘルパーサービス利用方法と料金表"
              type="guide"
              phase="軽度在宅ケア期"
            />
          </div>

          <h3 className="text-lg font-medium mb-4">進行期〜施設介護</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ResourceCard
              title="施設介護移行チェックリスト（判定＆準備項目）"
              description="施設介護への移行を検討するためのチェックリスト"
              type="checklist"
              phase="進行・備え期"
            />
            <ResourceCard
              title="家族会議サポートシート"
              description="家族間での話し合いをサポートするフォーマット"
              type="template"
              phase="進行・備え期"
            />
            <ResourceCard
              title="施設検索フィルター"
              description="条件に合った介護施設を検索するためのツール"
              type="tool"
              phase="施設介護移行"
            />
            <ResourceCard
              title="費用試算シミュレーター"
              description="施設入所にかかる費用を試算するツール"
              type="tool"
              phase="施設介護移行"
            />
            <ResourceCard
              title="入所手続きチェック"
              description="施設入所に必要な手続きと書類のチェックリスト"
              type="checklist"
              phase="施設介護移行"
            />
          </div>
        </TabsContent>

        <TabsContent value="general" className="mt-6">
          <h3 className="text-lg font-medium mb-4">医師に聞く質問テンプレート</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <ResourceCard
              title="急性期：医師への質問リスト"
              description="入院直後に主治医に確認すべき重要事項"
              type="template"
              phase="共通"
            />
            <ResourceCard
              title="リハビリ期：回復見込みの確認"
              description="リハビリ病院での回復可能性と今後の見通し"
              type="template"
              phase="共通"
            />
            <ResourceCard
              title="退院前：在宅ケアの準備"
              description="退院後の生活に必要な医療・介護サポート"
              type="template"
              phase="共通"
            />
            <ResourceCard
              title="認知症：症状と対応方法"
              description="認知症の進行度合いと家族の対応方法"
              type="template"
              phase="共通"
            />
            <ResourceCard
              title="服薬管理：副作用と注意点"
              description="処方薬の効果・副作用・注意事項の確認"
              type="template"
              phase="共通"
            />
          </div>

          <h3 className="text-lg font-medium mb-4">書類・申請</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <ResourceCard
              title="介護保険申請書セット"
              description="介護保険の申請に必要な書類一式"
              type="document"
              phase="共通"
            />
            <ResourceCard
              title="限度額適用認定証申請書"
              description="高額医療費の窓口負担を軽減する申請書"
              type="document"
              phase="共通"
            />
            <ResourceCard
              title="施設入所契約書チェックリスト"
              description="施設契約時の重要確認事項"
              type="checklist"
              phase="共通"
            />
            <ResourceCard
              title="医療情報提供書（紹介状）"
              description="医療機関間の情報連携に使用する書類"
              type="document"
              phase="共通"
            />
            <ResourceCard
              title="退院時サマリー確認リスト"
              description="退院時に確認すべき医療情報のリスト"
              type="checklist"
              phase="共通"
            />
            <ResourceCard
              title="成年後見申立書類セット"
              description="成年後見人選任の申立てに必要な書類"
              type="document"
              phase="共通"
            />
          </div>

          <h3 className="text-lg font-medium mb-4">家族会議・介護分担</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <ResourceCard
              title="家族会議アジェンダテンプレート"
              description="効率的な家族会議のための議題と進行表"
              type="template"
              phase="共通"
            />
            <ResourceCard
              title="介護分担表"
              description="家族間の介護タスク分担を明確化するシート"
              type="template"
              phase="共通"
            />
            <ResourceCard
              title="在宅 vs 施設 決定シート"
              description="介護方法を決めるための比較検討表"
              type="checklist"
              phase="共通"
            />
            <ResourceCard
              title="介護費用シミュレーション"
              description="今後必要になる介護費用の試算表"
              type="tool"
              phase="共通"
            />
            <ResourceCard
              title="緊急連絡網テンプレート"
              description="緊急時の連絡先と対応手順"
              type="template"
              phase="共通"
            />
          </div>

          <h3 className="text-lg font-medium mb-4">学習資料</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ResourceCard
              title="介護保険制度ガイド"
              description="介護保険の仕組みと申請方法の完全ガイド"
              type="guide"
              phase="共通"
            />
            <ResourceCard
              title="認知症ケアハンドブック"
              description="認知症の方への接し方と環境づくり"
              type="guide"
              phase="共通"
            />
            <ResourceCard
              title="在宅介護スタートガイド"
              description="在宅介護を始める前に知っておくべきこと"
              type="guide"
              phase="共通"
            />
            <ResourceCard
              title="施設選びのポイント"
              description="介護施設の種類と選び方のコツ"
              type="guide"
              phase="共通"
            />
            <ResourceCard
              title="介護者のセルフケア"
              description="介護疲れを防ぐためのセルフケア方法"
              type="guide"
              phase="共通"
            />
            <ResourceCard
              title="エンディングノートの書き方"
              description="将来に備えるエンディングノート作成ガイド"
              type="guide"
              phase="共通"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ResourceCardProps {
  title: string
  description: string
  type: "guide" | "template" | "document" | "checklist" | "tool"
  phase: string
}

function ResourceCard({ title, description, type, phase }: ResourceCardProps) {
  const typeIcons = {
    guide: <BookOpen className="h-10 w-10 text-blue-500" />,
    template: <FileText className="h-10 w-10 text-purple-500" />,
    document: <FileText className="h-10 w-10 text-red-500" />,
    checklist: <FileText className="h-10 w-10 text-green-500" />,
    tool: <Star className="h-10 w-10 text-orange-500" />,
  }

  const typeLabels = {
    guide: "ガイド",
    template: "テンプレート",
    document: "書類",
    checklist: "チェックリスト",
    tool: "ツール",
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          {typeIcons[type]}
          <Badge variant="outline">{typeLabels[type]}</Badge>
        </div>
        <CardTitle className="text-base mt-2">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardFooter className="pt-0 flex justify-between">
        <Badge variant="secondary" className="text-xs">
          {phase}
        </Badge>
        <Button variant="outline" size="sm" className="gap-1">
          <Download className="h-4 w-4" />
          取得
        </Button>
      </CardFooter>
    </Card>
  )
}

function CourseCard({ title, description, duration, level, lessons, image }: CourseCardProps) {
  return null
}

interface CourseCardProps {
  title: string
  description: string
  duration: string
  level: "初級" | "中級" | "上級"
  lessons: number
  image: string
}

interface ToolCardProps {
  title: string
  description: string
  type: "calculator" | "assessment" | "search" | "comparison" | "app" | "calendar"
}

function ToolCard({ title, description, type }: ToolCardProps) {
  return null
}

// Additional icons for ToolCard
function Calculator(props: React.SVGProps<SVGSVGElement>) {
  return null
}

function ClipboardCheck(props: React.SVGProps<SVGSVGElement>) {
  return null
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return null
}

function BarChart2(props: React.SVGProps<SVGSVGElement>) {
  return null
}

function Smartphone(props: React.SVGProps<SVGSVGElement>) {
  return null
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return null
}

function Clock(props: React.SVGProps<SVGSVGElement>) {
  return null
}

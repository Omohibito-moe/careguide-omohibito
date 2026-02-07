"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Download, FileText, MessageSquare, Share2 } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function TemplateLibrary() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">質問テンプレ／書式ライブラリ</h2>
      </div>

      <div className="relative">
        <Input
          placeholder="テンプレートを検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs defaultValue="medical">
        <TabsList className="w-full max-w-md grid grid-cols-3">
          <TabsTrigger value="medical">医師に聞く</TabsTrigger>
          <TabsTrigger value="documents">書類・申請</TabsTrigger>
          <TabsTrigger value="family">家族会議</TabsTrigger>
        </TabsList>

        <TabsContent value="medical" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <TemplateCard
              title="急性期：医師への質問リスト"
              description="入院直後に主治医に確認すべき重要事項"
              type="text"
            />
            <TemplateCard
              title="リハビリ期：回復見込みの確認"
              description="リハビリ病院での回復可能性と今後の見通し"
              type="text"
            />
            <TemplateCard
              title="退院前：在宅ケアの準備"
              description="退院後の生活に必要な医療・介護サポート"
              type="text"
            />
            <TemplateCard title="認知症：症状と対応方法" description="認知症の進行度合いと家族の対応方法" type="text" />
            <TemplateCard
              title="服薬管理：副作用と注意点"
              description="処方薬の効果・副作用・注意事項の確認"
              type="text"
            />
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <TemplateCard title="介護保険申請書セット" description="介護保険の申請に必要な書類一式" type="pdf" />
            <TemplateCard
              title="限度額適用認定証申請書"
              description="高額医療費の窓口負担を軽減する申請書"
              type="pdf"
            />
            <TemplateCard
              title="施設入所契約書チェックリスト"
              description="施設契約時の重要確認事項"
              type="checklist"
            />
            <TemplateCard
              title="医療情報提供書（紹介状）"
              description="医療機関間の情報連携に使用する書類"
              type="pdf"
            />
            <TemplateCard
              title="退院時サマリー確認リスト"
              description="退院時に確認すべき医療情報のリスト"
              type="checklist"
            />
            <TemplateCard title="成年後見申立書類セット" description="成年後見人選任の申立てに必要な書類" type="pdf" />
          </div>
        </TabsContent>

        <TabsContent value="family" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <TemplateCard
              title="家族会議アジェンダテンプレート"
              description="効率的な家族会議のための議題と進行表"
              type="text"
            />
            <TemplateCard
              title="介護分担表"
              description="家族間の介護タスク分担を明確化するシート"
              type="spreadsheet"
            />
            <TemplateCard
              title="在宅 vs 施設 決定シート"
              description="介護方法を決めるための比較検討表"
              type="checklist"
            />
            <TemplateCard
              title="介護費用シミュレーション"
              description="今後必要になる介護費用の試算表"
              type="spreadsheet"
            />
            <TemplateCard title="緊急連絡網テンプレート" description="緊急時の連絡先と対応手順" type="text" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface TemplateCardProps {
  title: string
  description: string
  type: "text" | "pdf" | "checklist" | "spreadsheet"
}

function TemplateCard({ title, description, type }: TemplateCardProps) {
  const typeIcons = {
    text: <MessageSquare className="h-10 w-10 text-blue-500" />,
    pdf: <FileText className="h-10 w-10 text-red-500" />,
    checklist: <FileText className="h-10 w-10 text-green-500" />,
    spreadsheet: <FileText className="h-10 w-10 text-purple-500" />,
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          {typeIcons[type]}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Copy className="h-4 w-4" />
            <span className="sr-only">コピー</span>
          </Button>
        </div>
        <CardTitle className="text-lg mt-2">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="pt-2 flex justify-between">
        <Button variant="outline" size="sm" className="gap-1">
          <Download className="h-4 w-4" />
          ダウンロード
        </Button>
        <Button variant="outline" size="sm" className="gap-1">
          <Share2 className="h-4 w-4" />
          共有
        </Button>
      </CardFooter>
    </Card>
  )
}

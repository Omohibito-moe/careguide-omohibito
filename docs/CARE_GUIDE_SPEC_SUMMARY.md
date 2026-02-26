# 想ひ人 ケアガイド - 現在の仕様サマリー

**最終更新**: 2026年2月26日
**対象バージョン**: MVP (v0.1)

---

## 1. プロダクト概要

### サービス名
**想ひ人 ケアガイド（おもいびと けあがいど）**

### コンセプト
介護が始まる瞬間に直面した家族が「何をすべきか分からない」状態から、明確な行動計画を持てるようになるまでをサポートする介護ナビゲーションWebアプリ。

**核となるフロー**: 最小診断で"現在地"を確定 → 簡易リライフプラン（フロー＋タスク）を即生成 → 詳細診断でプラン精緻化 → 既存タスクに「追記・置換・分解」して一元管理

### ビジョン
**「知ることは、希望を生む」** — 介護の絶望は、適切な制度やサービスを「知らない」ことから生まれる。

### ターゲットユーザー
- **プライマリ**: ビジネスケアラー（35〜55歳、フルタイム勤務者）
- **セカンダリ**: 備え期の家族（40〜60歳、まだ介護は始まっていない）

---

## 2. 技術スタック

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| フレームワーク | Next.js (App Router) | 16.1.6 |
| UI | React | 19.2.3 |
| 言語 | TypeScript | ^5 |
| スタイリング | Tailwind CSS | ^4 |
| AI | @anthropic-ai/sdk (Claude API) | ^0.73.0 |
| LINE連携 | @line/liff | ^2.27.3 |
| LINE Bot | @line/bot-sdk | ^10.6.0 |
| ホスティング | Vercel | - |

---

## 3. 画面構成と機能一覧

### 画面一覧

| パス | 画面名 | 実装状況 |
|------|--------|---------|
| `/` | トップページ | 実装済 |
| `/diagnosis` | 最小診断（2問） | 実装済 |
| `/diagnosis/detailed` | 詳細診断（10問・3ステップ） | 実装済 |
| `/plan` | リライフプラン（タスク管理） | 実装済 |
| `/chat` | AI相談チャット | 実装済 |
| `/preparedness` | 備え診断（20問） | 実装済 |

### 3.1 トップページ (`/`)

**役割**: サービスの入口。2つの導線を提供。

**主要CTA**:
- 「今、困っている」→ `/diagnosis`（最小診断）
- 「将来に備えたい」→ `/preparedness`（備え診断）

**補助機能**:
- LIFF統合（LINE内で起動時はユーザー名で挨拶表示）
- 既存データがある場合は「続きから」ボタンを表示

### 3.2 最小診断 (`/diagnosis`)

**役割**: 2問で「発生タイプ × 現在地フェーズ」を確定し、簡易リライフプランを生成する。

**Q1: 発生タイプ**

| 選択肢 | 値 |
|--------|----|
| 突然の発症（脳卒中・骨折等） | `sudden` |
| ゆるやかな変化（認知症・パーキンソン等） | `gradual` |

**Q2: 現在の状況（Q1の回答で分岐）**

突然の発症の場合:

| 選択肢 | 値 | マッピング先Phase |
|--------|----|----|
| 急性期病院に入院中 | `acute_hospital` | `acute` |
| リハビリ病院に入院中 | `rehab_hospital` | `rehab` |
| 退院し自宅で療養中 | `home_after_discharge` | `post_discharge` |
| 退院し施設で療養中 | `facility_after_discharge` | `post_discharge` |
| 最初から入院していない | `no_hospitalization` | `discharge_prep` |

ゆるやかな変化の場合:

| 選択肢 | 値 | マッピング先Phase |
|--------|----|----|
| 異変を感じるが受診していない | `not_visited` | `discovery` |
| 受診しているが介護保険を申請していない | `visited_no_insurance` | `medical_visit` |
| 介護保険を使用して在宅介護中 | `home_care_with_insurance` | `home_care` |

**出力**: MinimalDiagnosis + Plan生成 → `/plan` へ自動遷移

### 3.3 詳細診断 (`/diagnosis/detailed`)

**役割**: 10問の追加質問で既存プランを精緻化（アップグレード）する。

**前提条件**: 最小診断が完了済みであること。

**ステップ1（3問）: 本人の状態**

| 質問 | 選択肢 |
|------|--------|
| 要介護認定の状況 | 未申請 / 申請中 / 要支援1-2 / 要介護1-5 |
| 医療依存度 | なし / 通院のみ / 医療処置あり |
| 認知症の程度 | なし / 軽度 / 中等度 / 重度 |

**ステップ2（4問）: 家族・生活環境**

| 質問 | 選択肢 |
|------|--------|
| 主介護者の就労状況 | フルタイム / パート / 無職 / 自営 |
| 同居家族 | 独居 / 配偶者のみ / 子と同居 / その他 |
| 住居タイプ | 持ち家（戸建て）/ 持ち家（マンション）/ 賃貸 / 同居先 |
| 経済的不安 | ない / 少しある / 大きい |

**ステップ3（3問）: 希望・窓口の確認**

| 質問 | 選択肢 |
|------|--------|
| 退院後の希望 | 自宅 / 施設 / まだ決められない |
| 障害者手帳 | なし / あり / 該当するかわからない |
| 相談窓口への連絡 | はい / いいえ / わからない |

**出力**: タスクマージによる既存プランのアップグレード + 制度適用可能性の判定

### 3.4 リライフプラン (`/plan`)

**役割**: 統合ホーム。簡易版・詳細版を同一画面で表示。タスク管理の一元的な場所。

**タブ構成**:

1. **「対応フロー」タブ**:
   - 左側: フローステップ一覧（クリックでフェーズフィルタリング）+ 進捗バー
   - 右側: タスクリスト（チェックボックス、優先度バッジ、期限表示）
   - タスク展開: 詳細説明、必要書類、連絡先窓口

2. **「制度・サービス」タブ**（詳細版のみ）:
   - 関連制度・サービスの適用可能性一覧
   - カテゴリ: 介護保険 / 医療 / 自治体 / 経済的支援 / 民間 / 障害福祉

**CTAボタン**:
- 「プランを精密化する」→ 詳細診断へ
- 「AIに次の一手を確認する」→ AI相談チャットへ

### 3.5 AI相談チャット (`/chat`)

**役割**: Claude APIを使用した個別コンサルテーション。

**機能**:
- ユーザーの診断結果・フェーズ・タスク進捗をコンテキストとして自動送信
- `knowledge.ts` の専門知識ベース（8万文字超）をシステムプロンプトとして使用
- ストリーミング応答
- 会話履歴の保持
- クイックアクションボタン（推奨質問例）

**API設定**:
- モデル: `claude-sonnet-4-5-20250929`
- 最大トークン: 1024

### 3.6 備え診断 (`/preparedness`)

**役割**: まだ介護が始まっていない段階での準備支援。

**内容**: 20問の質問で以下を評価:
- 親の年齢・健康状態
- 介護キャパシティ
- 経済的準備
- 情報収集状況
- 安全対策

**出力**: リスク評価、アクションカード、家族との話し合いポイント

---

## 4. データモデル

### 4.1 診断モデル

```typescript
// 発生タイプ
type OnsetType = "sudden" | "gradual";

// フェーズ（8種類）
type Phase =
  | "acute"           // 急性期
  | "rehab"           // リハビリ期
  | "discharge_prep"  // 退院準備
  | "post_discharge"  // 退院後
  | "discovery"       // 気づき・発見
  | "medical_visit"   // 受診・検査
  | "prevention"      // 介護予防
  | "home_care";      // 在宅介護

// 最小診断
interface MinimalDiagnosis {
  id: string;
  onsetType: OnsetType;
  situation: Situation;
  phase: Phase;
  createdAt: string;
}

// 詳細診断
interface DetailedDiagnosis {
  id: string;
  minimalDiagnosisId: string;
  completedSteps: number; // 1, 2, or 3
  careLevel?: CareLevel;
  medicalDependency?: MedicalDependency;
  dementiaLevel?: DementiaLevel;
  employmentStatus?: EmploymentStatus;
  livingArrangement?: LivingArrangement;
  housingType?: HousingType;
  financialConcern?: FinancialConcern;
  postDischargePreference?: PostDischargePreference;
  disabilityCard?: DisabilityCard;
  contactedOffice?: ContactedOffice;
  createdAt: string;
}
```

### 4.2 プランモデル

```typescript
interface Plan {
  planId: string;
  version: "minimal" | "detailed";
  minimalDiagnosisId: string;
  detailedDiagnosisId?: string;
  phase: Phase;
  phaseLabelJa: string;
  conclusionSummary: string;
  firstContact: string;
  tasks: Task[];
  archivedTasks: Task[];
  flowSteps: FlowStep[];
  serviceEligibilities?: ServiceEligibility[];
  createdAt: string;
  updatedAt: string;
}
```

### 4.3 タスクモデル

```typescript
interface Task {
  taskId: string;
  title: string;
  description: string;
  status: "todo" | "done";
  source: "minimal" | "detailed" | "manual";
  priority: "high" | "normal";
  deadline: TaskDeadline;
  parentTaskId: string | null;
  phase: Phase;
  moshimoNaviCategory?: MoshimoNaviCategory;
  documents?: string[];
  contactOffice?: string;
  templateLinks?: string[];
  relatedServiceCategory?: ServiceCategory;
  archivedAt?: string;
  mergedFrom?: { action: MergeAction; sourceTaskId: string; mergedAt: string };
  createdAt: string;
  updatedAt: string;
}

// 期限
type TaskDeadline = "immediate" | "within_24h" | "within_48h" | "within_72h"
  | "within_1week" | "within_2weeks" | "within_1month" | "ongoing";

// もしもナビA-Eカテゴリ
type MoshimoNaviCategory =
  | "A_medical"     // A: 医師・看護師の話を聞く
  | "B_family"      // B: 家族で話し合う
  | "C_home"        // C: 自宅の場合 介護体制構築
  | "D_facility"    // D: 施設の場合 施設探し
  | "E_work";       // E: 仕事・職場との調整
```

---

## 5. フロー定義

### 5.1 突然型フロー（6ステップ）

| Step | ラベル | 期間 |
|------|--------|------|
| s1 | 急性期病院 | 入院0〜72時間〜2週間 |
| s2 | リハビリ病院 | 2週間〜3ヶ月 |
| s3 | 退院準備 | 退院2〜4週前 |
| s4 | 退院 | 退院当日 |
| s5 | 在宅介護 / 施設入所 | 退院後0〜1ヶ月 |
| s6 | 継続フォロー | 以降 |

### 5.2 ゆるやか型フロー（5ステップ）

| Step | ラベル | 内容 |
|------|--------|------|
| g1 | 気づき・発見 | 物忘れ・体力低下・日常の変化 |
| g2 | 受診・検査 | かかりつけ医 or 専門医を受診 |
| g3 | 介護予防・申請準備 | 介護保険申請・相談 |
| g4 | 在宅介護 | ケアプランに基づくサービス利用 |
| g5 | 継続・見直し | 定期的なケアプラン見直し |

---

## 6. タスクテンプレート

### フェーズ別タスク数

| フェーズ | タスク数 | 主な内容 |
|---------|---------|---------|
| acute（急性期） | 8件 | 病状確認、MSW面談、介護保険申請、高額療養費、家族会議、会社報告 |
| rehab（リハビリ） | 11件 | 介護保険申請、退院後検討、カンファレンス、ケアマネ探し、住環境確認、施設見学 |
| discharge_prep（退院準備） | 5件 | 介護保険申請、地域包括連絡、退院後方針決定、家族会議、復職検討 |
| post_discharge（退院後） | 6件 | サービス開始、環境整備、ケアマネ連携、経済支援確認、介護者ケア |
| discovery（気づき） | 4件 | 受診、症状記録、地域包括相談、家族共有 |
| medical_visit（受診） | 4件 | 介護保険申請、地域包括連絡、診断確認、家族共有 |
| prevention（予防） | 3件 | 介護保険申請完了、ケアマネ探し、サービス確認 |
| home_care（在宅介護） | 4件 | ケアプラン見直し、追加サービス確認、介護者負担確認、経済支援見直し |

**合計: 45件のタスクテンプレート**

---

## 7. タスクマージ仕様

詳細診断後、既存タスクに対して以下3種類の操作で反映する。新規リストの独立生成は禁止。

### 7.1 enrich（追記）
既存タスクの `description`、`documents`、`contactOffice`、`templateLinks` を追加・更新。`taskId` は変更しない。

**トリガー例**: 介護保険が未申請（`not_applied`）→ タスクに詳細手順を追記

### 7.2 replace（置換）
簡易タスクをアーカイブし、より正確な詳細タスクに差し替え。旧タスクの `taskId` を引き継ぐ。

**トリガー例**: 介護保険が申請中（`applying`）→ 「申請する」を「認定結果を確認する」に置換

### 7.3 split（分解）
簡易タスク1つを複数の詳細タスクに分割。親タスクは「まとめ」として残し、子タスク全完了で親も自動完了。

**トリガー例**: 医療処置あり → 退院後タスクを「訪問看護手配」「在宅医探し」「医療機器セットアップ」に分解

### マージトリガー条件

| 条件 | アクション |
|------|----------|
| 介護保険未申請 | enrich（詳細手順追記） |
| 介護保険申請中 | replace（確認タスクに置換） |
| 医療処置依存あり | split（退院後タスクを分解） |
| 認知症あり | enrich（家族会議タスクに見守り情報追記） |
| 経済的不安あり | enrich（経済支援情報追記） |
| 障害者手帳あり/不明 | enrich（障害福祉サービス情報追記） |
| フルタイム就労 | enrich（介護休業制度情報追記） |

---

## 8. 状態管理

### アーキテクチャ
- **React Context** (`AppStateContext`) でグローバル状態管理
- **localStorage** (`careguide_state` キー) で永続化
- サーバーサイドDBなし（ステートレス）

### 状態構造

```typescript
interface AppState {
  minimalDiagnosis: MinimalDiagnosis | null;
  detailedDiagnosis: DetailedDiagnosis | null;
  plan: Plan | null;
  assessmentResult: AssessmentResult | null;
  preparednessResult: PreparednessResult | null;
}
```

### 状態遷移

```
[未診断] → Q1+Q2 → [簡易プラン生成済み] → 詳細診断 → [詳細プラン反映済み]
                         │                                │
                         └──── タスク操作 ◄────────────────┘
```

---

## 9. API仕様

### POST `/api/chat`

**リクエスト**:
```json
{
  "messages": [{ "role": "user", "content": "質問内容" }],
  "caseContext": {
    "onsetType": "sudden",
    "phase": "acute",
    "tasksCompleted": 2,
    "tasksTotal": 8,
    "priorityTasks": ["タスク名..."],
    "detailedDiagnosis": { ... }
  }
}
```

**レスポンス**: `{ "reply": "回答テキスト" }`

### POST `/api/line/webhook`
LINE Bot Webhook（プレースホルダー、未完成）

---

## 10. デザインシステム

### カラー

| 用途 | カラーコード |
|------|------------|
| Primary | `#2563eb` |
| Accent | `#fbbf24` |
| Point（優先度表示） | `#ef4444` |
| テキスト | `#374151` |
| 背景 | `#f9fafb` |

### コンポーネント
- `.btn-primary` / `.btn-secondary`: ボタン
- `.card` / `.card-active`: カード
- `.badge-priority`: 優先度バッジ
- `.animate-fade-in-up`: フェードインアニメーション

### レスポンシブ
モバイルファースト設計。ブレークポイント: 640px / 768px / 1024px / 1280px

---

## 11. 実装済み / 未実装の機能

### 実装済み

| 機能 | 状態 |
|------|------|
| 最小診断（2問） | 実装済 |
| 詳細診断（10問・3ステップ） | 実装済 |
| リライフプラン生成 | 実装済 |
| タスク管理（チェック・展開） | 実装済 |
| フェーズ別フィルタリング | 実装済 |
| タスクマージエンジン（enrich/replace/split） | 実装済 |
| AI相談（Claude API統合） | 実装済 |
| 備え診断（20問） | 実装済 |
| LIFF統合（LINE内動作） | 実装済 |
| localStorage永続化 | 実装済 |
| レスポンシブUI | 実装済 |

### 未実装

| 機能 | 優先度 |
|------|--------|
| ユーザーアカウント/認証 | Phase 2 |
| バックエンドDB（永続化） | Phase 2 |
| プランPDF出力 | Phase 2 |
| リマインダー通知（LINE） | Phase 2 |
| 家族共有機能 | Phase 2 |
| LINE Bot Webhook（本格実装） | Phase 2 |
| 施設検索API統合 | Phase 3 |
| ケアマネージャー検索 | Phase 3 |
| 自治体窓口DB連携 | Phase 3 |
| E2Eテスト | 技術的負債 |

---

## 12. ファイル構成

```
src/
├── app/
│   ├── page.tsx                    # トップページ
│   ├── layout.tsx                  # ルートレイアウト
│   ├── providers.tsx               # コンテキストプロバイダ
│   ├── globals.css                 # グローバルCSS + デザインシステム
│   ├── diagnosis/
│   │   ├── page.tsx                # 最小診断（2問）
│   │   └── detailed/page.tsx       # 詳細診断（10問）
│   ├── plan/page.tsx               # リライフプラン
│   ├── chat/page.tsx               # AI相談
│   ├── preparedness/page.tsx       # 備え診断
│   └── api/
│       ├── chat/route.ts           # Claude API エンドポイント
│       └── line/webhook/route.ts   # LINE Webhook
├── lib/
│   ├── constants.ts                # 診断定数、タスクテンプレート、フロー定義
│   ├── diagnosis.ts                # 診断ロジック、プラン生成、タスクマージ
│   ├── knowledge.ts                # AIナレッジベース（システムプロンプト）
│   ├── store.tsx                   # 状態管理（React Context + localStorage）
│   └── liff.tsx                    # LINE LIFF統合
└── types/
    └── index.ts                    # TypeScript型定義
```

---

## 13. MVP検証の成功基準

1. 最小診断完了率 > 80%（2問なので離脱は少ないはず）
2. タスク1つ以上チェック完了率 > 50%（行動につながった証拠）
3. 詳細診断への遷移率 > 30%（プラン精緻化の需要確認）

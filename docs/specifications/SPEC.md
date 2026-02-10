# 想ひ人 ケアガイド - システム仕様書

**バージョン**: 1.0
**最終更新**: 2026年2月8日
**プロジェクト名**: careguide-omohibito

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [目的とビジョン](#2-目的とビジョン)
3. [ターゲットユーザー](#3-ターゲットユーザー)
4. [システムアーキテクチャ](#4-システムアーキテクチャ)
5. [機能仕様](#5-機能仕様)
6. [ユーザーフロー](#6-ユーザーフロー)
7. [データモデル](#7-データモデル)
8. [画面仕様](#8-画面仕様)
9. [API仕様](#9-api仕様)
10. [デザインシステム](#10-デザインシステム)
11. [技術スタック](#11-技術スタック)
12. [セキュリティ](#12-セキュリティ)
13. [今後の拡張性](#13-今後の拡張性)

---

## 1. プロジェクト概要

### 1.1 サービス名
**想ひ人 ケアガイド（おもいびと けあがいど）**

### 1.2 サービスの位置づけ
介護が始まる瞬間に直面した家族が、何をすべきか分からない状態から、明確な行動計画を持てるようになるまでをサポートする、LINE上で動作する介護ナビゲーションアプリケーション。

### 1.3 核となるコンセプト
- **「もしもナビ」統合版**: 過去に開発された「もしもナビ」のA-Eカテゴリ構造を継承
- **診断 → プラン生成 → タスク管理**: シンプルな質問から個別最適化された行動計画を自動生成
- **生活PM（プロジェクトマネージャー）**: 医療・介護・不動産・財産など縦割りの専門家を横断整理し、家族の生活を再設計する存在

### 1.4 プロジェクトの背景
- 2030年には介護離職による経済損失が約9兆円に達する見込み
- ビジネスケアラー（働きながら介護する人）の増加
- 介護に関する情報の複雑さと、窓口の縦割り問題
- 「知らない」ことから生まれる絶望を「希望」に変える

---

## 2. 目的とビジョン

### 2.1 プロダクトの目的

#### 主要目的
1. **意思決定の支援**: 「どこで・誰が・どの資金で」介護するかの3大要素を整理
2. **手続き負担の削減**: 平均150時間以上かかる手続きを効率化
3. **介護離職の防止**: 適切な制度活用と体制構築により仕事との両立を実現
4. **家族崩壊の回避**: 過度な家族介護を避け、専門家への委託を推奨

#### 副次的目的
- 介護に関する正しい知識の提供
- 地域包括支援センター、MSWなど適切な窓口への誘導
- 家族間の役割分担と合意形成の支援
- 経済的支援制度の見落とし防止

### 2.2 ビジョン
**「知ることは、希望を生む」**

介護の絶望は、適切な制度やプロダクトを「知らない」ことから生まれる。できないことがあっても、それを補うサポートや制度は世の中にたくさんある、という事実を伝える。

---

## 3. ターゲットユーザー

### 3.1 プライマリーターゲット

#### ビジネスケアラー（現役世代の介護者）
- **年齢**: 35〜55歳
- **職業**: フルタイム勤務者、自営業者
- **状況**:
  - 親や配偶者が突然倒れた（脳卒中、骨折等）
  - 親の認知症が進行してきた
  - 病院から退院を促されている
  - 仕事と介護の両立に悩んでいる
- **課題**:
  - 何から手をつければいいか分からない
  - 介護保険の申請方法が分からない
  - 仕事を辞めるべきか悩んでいる
  - 家族で意見が分かれている

#### 具体的なペルソナ例

**ペルソナ1: 田中 美香（42歳、会社員）**
- 父親（75歳）が脳卒中で緊急搬送され、急性期病院に入院中
- フルタイムで営業職、マネージャーポジション
- 母親は既に他界、兄は遠方在住で頼れない
- 退院後の生活をどうすべきか、病院から2週間以内に方針決定を求められている
- 介護離職を考えているが、経済的に不安

**ペルソナ2: 佐藤 健太（50歳、自営業）**
- 母親（78歳）の物忘れが激しくなり、認知症の疑い
- 自営業で時間の融通は効くが、収入が不安定
- 妻と二人の子供（高校生・中学生）と同居
- 母親は一人暮らしで、週1回様子を見に行っている
- 施設入所も考えているが、母親が強く拒否

### 3.2 セカンダリーターゲット

#### 備え期の家族
- **年齢**: 40〜60歳
- **状況**: まだ介護は始まっていないが、将来に備えたい
- **ニーズ**: 親との終活対話、リスク診断、事前の情報収集

#### 介護従事者・支援者
- **職種**: 地域包括支援センター職員、MSW、ケアマネージャー
- **ニーズ**: 利用者への情報提供ツールとして活用

---

## 4. システムアーキテクチャ

### 4.1 システム構成図

```
┌─────────────────────────────────────────────┐
│           LINE アプリ (LIFF)                │
│  ┌───────────────────────────────────────┐  │
│  │    想ひ人 ケアガイド Web App           │  │
│  │  (Next.js 16 + React 19 + TypeScript) │  │
│  │                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │  診断フロー  │  │  プラン表示  │   │  │
│  │  └──────────────┘  └──────────────┘   │  │
│  │  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │ タスク管理   │  │ AI相談       │   │  │
│  │  └──────────────┘  └──────────────┘   │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                      ↓ API通信
┌─────────────────────────────────────────────┐
│          Next.js API Routes                 │
│  ┌───────────────────────────────────────┐  │
│  │  /api/chat (Claude AI統合)            │  │
│  │  /api/diagnosis (診断ロジック)        │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│       外部サービス                          │
│  ┌──────────────┐  ┌──────────────┐        │
│  │ Anthropic    │  │  LINE        │        │
│  │ Claude API   │  │  Platform    │        │
│  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────┘
```

### 4.2 データフロー

```
1. ユーザーがLINEアプリからアクセス
   ↓
2. LIFF初期化（LINE認証）
   ↓
3. 最小診断（2問）実行
   ↓
4. フェーズ判定 + タスクリスト生成
   ↓
5. リライフプラン表示（簡易版）
   ↓
6. [オプション] 詳細診断（3ステップ）
   ↓
7. プラン精緻化（タスクのマージ・分解・追記）
   ↓
8. タスク進捗管理
   ↓
9. [オプション] AI相談（Claude API経由）
```

### 4.3 状態管理

**グローバルステート（React Context）**
- `AppStateContext`: アプリ全体の状態を管理
  - `minimalDiagnosis`: 最小診断結果
  - `detailedDiagnosis`: 詳細診断結果
  - `plan`: 生成されたリライフプラン
  - `assessmentResult`: 備え診断結果

**ローカルステート**
- 各ページコンポーネントで必要に応じて管理
- フォーム入力、UI状態（モーダル表示等）

### 4.4 デプロイメント構成

- **ホスティング**: Vercel
- **環境変数管理**: Vercel Environment Variables
- **ブランチ戦略**:
  - `main`: 本番環境
  - `claude/*`: 開発用ブランチ（Claude Codeで作業）
- **CI/CD**: Vercel自動デプロイ

---

## 5. 機能仕様

### 5.1 機能一覧

| 機能ID | 機能名 | 優先度 | 実装状況 |
|--------|--------|--------|----------|
| F-001 | 最小診断（2問） | 必須 | ✅ 実装済 |
| F-002 | 詳細診断（3ステップ） | 必須 | ✅ 実装済 |
| F-003 | リライフプラン生成 | 必須 | ✅ 実装済 |
| F-004 | タスク管理（チェックリスト） | 必須 | ✅ 実装済 |
| F-005 | フェーズ別タスクフィルタリング | 必須 | ✅ 実装済 |
| F-006 | AI相談（Claude統合） | 必須 | ✅ 実装済 |
| F-007 | 備え診断（そなえモード） | 推奨 | ✅ 実装済 |
| F-008 | LINEシェア機能 | 推奨 | ✅ 実装済 |
| F-009 | チャット履歴保存 | 任意 | ✅ 実装済 |
| F-010 | プランPDF出力 | 任意 | ❌ 未実装 |
| F-011 | 家族共有機能 | 任意 | ❌ 未実装 |
| F-012 | リマインダー通知 | 任意 | ❌ 未実装 |

### 5.2 詳細機能仕様

#### F-001: 最小診断（2問）

**目的**: 最短ルートでユーザーの状況を把握し、適切なフェーズとタスクを提示

**質問内容**:
1. **Q1: 発症タイプ**
   - 突然の発症（脳卒中・骨折等）: `sudden`
   - ゆるやかな変化（認知症・パーキンソン等）: `gradual`

2. **Q2: 現在の状況**
   - **突然タイプの場合**:
     - 急性期病院に入院中: `acute_hospital`
     - リハビリ病院に転院済み: `rehab_hospital`
     - 自宅に退院済み: `home_after_discharge`
     - 施設に入所済み: `facility_after_discharge`
     - 入院せず自宅療養中: `no_hospitalization`

   - **ゆるやかタイプの場合**:
     - 異変を感じるが受診していない: `not_visited`
     - 受診しているが介護保険を申請していない: `visited_no_insurance`
     - 介護保険を使用して在宅介護中: `home_care_with_insurance`

**出力**:
- `Phase`: 診断されたフェーズ
- `PhaseLabelJa`: フェーズの日本語ラベル
- `ConclusionSummary`: 状況サマリー
- `FirstContact`: 最初に連絡すべき窓口
- `Tasks[]`: 生成されたタスクリスト

**フェーズマッピング**:

```typescript
突然タイプ:
  acute_hospital → acute (急性期病院)
  rehab_hospital → rehab (リハビリ病院)
  home_after_discharge → post_discharge (退院後)
  facility_after_discharge → post_discharge (退院後)
  no_hospitalization → discharge_prep (退院準備)

ゆるやかタイプ:
  not_visited → discovery (気づき・発見)
  visited_no_insurance → medical_visit (受診・検査)
  home_care_with_insurance → home_care (在宅介護)
```

#### F-002: 詳細診断（3ステップ）

**目的**: より詳細な状況把握により、タスクを精緻化

**Step 1: 介護・医療の状況**
- 介護保険の要介護度
- 医療依存度（通院のみ / 医療処置が必要）
- 認知症の程度（なし / 軽度 / 中等度 / 重度）

**Step 2: 生活・経済の状況**
- 就労状況（フルタイム / パートタイム / 無職 / 自営業）
- 居住形態（一人暮らし / 配偶者と二人 / 子と同居 / その他）
- 住宅の種類（持ち家戸建て / 持ち家マンション / 賃貸 / 同居）
- 経済的な不安（なし / 多少あり / 大きい）

**Step 3: 希望・窓口の確認**
- 退院後の希望（自宅 / 施設 / 未定）
- 障害者手帳の有無
- 地域包括支援センターへの相談状況

**出力**:
- 詳細診断結果をもとにプランをアップグレード
- タスクのマージ（enrich / replace / split）
- 制度適用可能性の判定
- リスク・注意点の抽出
- 家族会議のポイント提示

#### F-003: リライフプラン生成

**構成要素**:

```typescript
Plan {
  version: "minimal" | "detailed"
  phase: Phase
  phaseLabelJa: string
  conclusionSummary: string
  firstContact: string
  tasks: Task[]
  flowSteps: FlowStep[]
  serviceEligibilities?: ServiceEligibility[]  // 詳細版のみ
}
```

**タスク生成ロジック**:
1. フェーズに応じたタスクテンプレートを選択
2. 各タスクにフェーズと「もしもナビA-Eカテゴリ」を付与
3. 詳細診断結果に応じてタスクをマージ・精緻化

#### F-004: タスク管理

**タスクの属性**:
- `taskId`: 一意識別子
- `title`: タスク名
- `description`: 詳細説明
- `status`: `todo` | `done`
- `priority`: `high` | `normal`
- `deadline`: 期限（即座 / 24時間以内 / 1週間以内 等）
- `phase`: 所属フェーズ
- `moshimoNaviCategory`: A-Eカテゴリ
- `documents`: 必要書類リスト
- `contactOffice`: 連絡先窓口

**操作**:
- チェックボックスでタスクの完了/未完了を切り替え
- 親タスクは子タスクが全て完了すると自動的に完了
- 展開/折りたたみで詳細情報を表示

#### F-005: フェーズ別タスクフィルタリング

**実装方法**:
1. 左側のフローステップをクリック
2. `getPhaseFromStepId()` でstepIdからPhaseを取得
3. タスクリストを該当フェーズのタスクのみに絞り込み
4. 進捗バーもフェーズごとの完了率を表示

**もしもナビA-Eカテゴリ**:
- A: 医師・看護師の話を聞く（`A_medical`）
- B: 家族で話し合う（`B_family`）
- C: 自宅の場合 介護体制構築（`C_home`）
- D: 施設の場合 施設探し（`D_facility`）
- E: 仕事・職場との調整（`E_work`）

#### F-006: AI相談

**機能概要**:
- Claude API（Anthropic）を使用したチャット機能
- ユーザーの状況を理解した上で個別アドバイスを提供

**システムプロンプト**:
`knowledge.ts` に格納された約8万文字の専門知識ベース
- 想ひ人の哲学・トーン
- 介護保険制度の基本
- 疾患別対応ガイド
- 制度・サービスの実務的注意点
- 相談対応のフレームワーク

**会話フロー**:
1. ユーザーが質問を入力
2. システムプロンプト + ケース情報 + 会話履歴を送信
3. Claude APIから回答を取得
4. ストリーミング表示

#### F-007: 備え診断（そなえモード）

**目的**: まだ介護が始まっていない段階での準備支援

**診断内容**:
- 親の年齢・健康状態
- 家族構成・連絡頻度
- 終活・事前準備の状況
- 経済的準備

**出力**:
- リスク診断結果
- 優先的に準備すべきこと
- 推奨カード（アクションアイテム）

---

## 6. ユーザーフロー

### 6.1 メインフロー

```
[LINE起動]
    ↓
[LIFFアプリ起動] (/) ← ホーム画面
    ↓
┌───────────────────────────┐
│ 2つの選択肢               │
│ ① いますぐ相談            │
│ ② そなえておく            │
└───────────────────────────┘
    ↓ ①を選択
[最小診断] (/diagnosis)
    ↓ Q1: 発症タイプ選択
    ↓ Q2: 現在の状況選択
    ↓
[リライフプラン表示] (/plan)
    ├→ [対応フロー]タブ
    │   ├ フローステップ一覧（左）
    │   │   ├ クリックでフェーズ選択
    │   │   └ 進捗バー表示
    │   └ タスクリスト（右）
    │       ├ フェーズでフィルタリング
    │       ├ チェックボックスで完了管理
    │       └ 展開で詳細表示
    │
    └→ [制度・サービス]タブ（詳細版のみ）
        ├ 関連する制度・サービス
        ├ 進め方ガイド
        ├ 注意すべきリスク
        └ 家族会議のポイント
    ↓
[詳細診断へ進む] (/diagnosis/detailed)
    ↓ Step 1: 介護・医療の状況
    ↓ Step 2: 生活・経済の状況
    ↓ Step 3: 希望・窓口の確認
    ↓
[プラン精緻化] (/plan)
    ├ タスクがマージされる
    ├ 制度適用可能性が追加
    ├ リスク・注意点が表示
    └ 家族会議のポイントが表示
    ↓
[AI相談] (/consult)
    ├ 現在の状況を踏まえた相談
    ├ Claude APIによる個別アドバイス
    └ 会話履歴保存
```

### 6.2 備えフロー

```
[ホーム] (/)
    ↓ ②そなえておく を選択
[備え診断] (/preparedness)
    ↓ 10問程度の質問に回答
    ↓
[診断結果表示]
    ├ リスク評価
    ├ 優先アクションアイテム
    ├ 推奨カード（行動提案）
    └ 2週間タスクリスト
```

### 6.3 画面遷移図

```
Home (/)
  ├─→ Diagnosis (/diagnosis)
  │     ├─→ Diagnosis Detailed (/diagnosis/detailed)
  │     │     └─→ Plan (/plan) [精緻化版]
  │     └─→ Plan (/plan) [簡易版]
  │           ├─→ Consult (/consult)
  │           └─→ Chat (/chat) [旧版・互換用]
  │
  └─→ Preparedness (/preparedness)
        └─→ Assessment Result [埋め込み表示]
```

---

## 7. データモデル

### 7.1 診断関連

#### MinimalDiagnosis（最小診断）

```typescript
interface MinimalDiagnosis {
  id: string;                    // UUID
  onsetType: OnsetType;          // "sudden" | "gradual"
  situation: Situation;          // 状況（9パターン）
  phase: Phase;                  // 判定されたフェーズ
  createdAt: string;             // ISO8601形式
}
```

#### DetailedDiagnosis（詳細診断）

```typescript
interface DetailedDiagnosis {
  id: string;
  minimalDiagnosisId: string;
  completedSteps: number;        // 1, 2, or 3

  // Step 1
  careLevel?: CareLevel;
  medicalDependency?: MedicalDependency;
  dementiaLevel?: DementiaLevel;

  // Step 2
  employmentStatus?: EmploymentStatus;
  livingArrangement?: LivingArrangement;
  housingType?: HousingType;
  financialConcern?: FinancialConcern;

  // Step 3
  postDischargePreference?: PostDischargePreference;
  disabilityCard?: DisabilityCard;
  contactedOffice?: ContactedOffice;

  createdAt: string;
}
```

### 7.2 プラン関連

#### Plan（リライフプラン）

```typescript
interface Plan {
  planId: string;
  version: "minimal" | "detailed";
  minimalDiagnosisId: string;
  detailedDiagnosisId?: string;

  phase: Phase;                   // 現在のフェーズ
  phaseLabelJa: string;           // "急性期病院（入院0〜2週間）"
  conclusionSummary: string;      // 状況サマリー
  firstContact: string;           // 最初に連絡すべき窓口

  tasks: Task[];                  // タスクリスト
  archivedTasks: Task[];          // アーカイブされたタスク
  flowSteps: FlowStep[];          // フローステップ

  // 詳細版のみ
  serviceEligibilities?: ServiceEligibility[];

  createdAt: string;
  updatedAt: string;
}
```

#### Task（タスク）

```typescript
interface Task {
  taskId: string;
  title: string;                  // "会社に状況を報告する"
  description: string;            // 詳細説明
  status: "todo" | "done";
  source: "minimal" | "detailed" | "manual";
  priority: "high" | "normal";
  deadline: TaskDeadline;         // "within_24h" 等
  parentTaskId: string | null;    // 親タスクID（サブタスクの場合）

  phase: Phase;                   // 所属フェーズ
  moshimoNaviCategory?: MoshimoNaviCategory;  // A〜E

  documents?: string[];           // 必要書類
  contactOffice?: string;         // 連絡先窓口
  templateLinks?: string[];       // テンプレートリンク
  relatedServiceCategory?: ServiceCategory;

  archivedAt?: string;
  mergedFrom?: TaskMergeHistory;  // マージ履歴

  createdAt: string;
  updatedAt: string;
}
```

#### FlowStep（フローステップ）

```typescript
interface FlowStep {
  stepId: string;                 // "s1", "s2", "g1", ...
  label: string;                  // "急性期病院"
  description: string;            // "入院0〜72時間〜2週間。救急搬送..."
  isCurrent: boolean;             // 現在のステップか
  order: number;                  // 表示順序
}
```

### 7.3 フェーズとステップのマッピング

```typescript
突然タイプ (sudden):
  s1 → acute           (急性期病院)
  s2 → rehab           (リハビリ病院)
  s3 → discharge_prep  (退院準備)
  s4 → post_discharge  (退院)
  s5 → post_discharge  (退院後生活)

ゆるやかタイプ (gradual):
  g1 → discovery       (気づき・発見)
  g2 → medical_visit   (受診・検査)
  g3 → prevention      (介護予防・申請準備)
  g4 → home_care       (在宅介護)
  g5 → home_care       (在宅介護継続)
```

### 7.4 もしもナビA-Eカテゴリ

```typescript
type MoshimoNaviCategory =
  | "A_medical"     // A: 医師・看護師の話を聞く
  | "B_family"      // B: 家族で話し合う
  | "C_home"        // C: 自宅の場合 介護体制構築
  | "D_facility"    // D: 施設の場合 施設探し
  | "E_work";       // E: 仕事・職場との調整
```

**カテゴリごとの主なタスク例**:

**A_medical（医師・看護師の話を聞く）**:
- 医師から病状と回復見込みを確認する
- 退院後に必要な生活支援を看護師に確認する
- 医療ソーシャルワーカー（MSW）に面談を依頼する

**B_family（家族で話し合う）**:
- 緊急家族会議を開く（役割分担の決定）
- 家族で費用負担について話し合う
- 親の希望と家族の意見をすり合わせる

**C_home（自宅の場合 介護体制構築）**:
- 住宅改修の必要性を確認する
- 福祉用具のレンタルを手配する
- ヘルパーやデイサービスを手配する

**D_facility（施設の場合 施設探し）**:
- 施設の種類を理解する
- 予算とエリアを決める
- 施設見学を予約する

**E_work（仕事・職場との調整）**:
- 会社に状況を報告する
- 介護休業制度を確認する
- 在宅勤務や時短勤務の相談をする

---

## 8. 画面仕様

### 8.1 画面一覧

| 画面ID | 画面名 | パス | 説明 |
|--------|--------|------|------|
| SCR-001 | ホーム | `/` | トップ画面、診断の開始点 |
| SCR-002 | 最小診断 | `/diagnosis` | 2問の診断フロー |
| SCR-003 | 詳細診断 | `/diagnosis/detailed` | 3ステップの詳細診断 |
| SCR-004 | プラン | `/plan` | リライフプラン表示・タスク管理 |
| SCR-005 | AI相談 | `/consult` | Claude AIとの相談チャット |
| SCR-006 | チャット | `/chat` | レガシーチャット（互換用） |
| SCR-007 | 備え診断 | `/preparedness` | 備え診断フロー |

### 8.2 詳細画面仕様

#### SCR-001: ホーム画面 (/)

**レイアウト**:
```
┌─────────────────────────────────┐
│  [ロゴ] 想ひ人 ケアガイド         │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │   いますぐ相談             │   │
│  │   介護が始まってしまった   │   │
│  │   [始める →]              │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │   そなえておく             │   │
│  │   まだ始まっていない       │   │
│  │   [始める →]              │   │
│  └─────────────────────────┘   │
│                                 │
│  [過去の相談を続ける]           │
│                                 │
└─────────────────────────────────┘
```

**機能**:
- LIFF初期化
- 既存の診断データがあれば「続きから」ボタンを表示
- 「いますぐ相談」→ 最小診断へ
- 「そなえておく」→ 備え診断へ

#### SCR-004: プラン画面 (/plan)

**タブ構成**:
1. **対応フロー**: メインのタスク管理画面
2. **制度・サービス**: 関連制度・リスク・家族会議ポイント（詳細版のみ）

**対応フローの構成**:

```
┌─────────────────────────────────────────────┐
│ ← リライフプラン                             │
│                                             │
│ [対応フロー] [制度・サービス]               │
├──────────────┬──────────────────────────────┤
│              │                              │
│  フロー表示  │   やるべきことと参考資料     │
│  (左側)      │   (右側)                     │
│              │                              │
│  ┌────────┐ │   ┌──────────────────┐      │
│  │急性期  │ │   │□ タスク1 [優先]  │      │
│  │ 50%    │ │   │  期限: 24時間以内 │      │
│  └────────┘ │   └──────────────────┘      │
│  ┌────────┐ │   ┌──────────────────┐      │
│  │リハビリ│ │   │□ タスク2         │      │
│  │ 0%     │ │   │  期限: 1週間以内  │      │
│  └────────┘ │   └──────────────────┘      │
│              │                              │
│  [最初に連絡] │   [詳細診断を受ける]         │
│              │   [AIに次にやるべきことを確認]       │
└──────────────┴──────────────────────────────┘
```

**フェーズ別フィルタリング**:
- 左側のフローステップをクリック → 右側のタスクがそのフェーズのものに絞り込まれる
- 進捗バーはフェーズごとの完了率を表示
- アクティブなステップはハイライト表示

**タスクカード**:
```
┌────────────────────────────────┐
│ □  会社に状況を報告する   [優先] │
│    急性期病院                  │
│    期限: 24時間以内             │
│    [▼ 展開]                    │
└────────────────────────────────┘
  ↓ 展開時
┌────────────────────────────────┐
│ □  会社に状況を報告する   [優先] │
│    急性期病院                  │
│    期限: 24時間以内             │
│                                │
│    【詳細】                    │
│    上司と人事担当に親が入院した │
│    ことを伝え、今後のスケジュー │
│    ル調整の可能性を相談する。   │
│                                │
│    【連絡先】                  │
│    📞 人事部・上司             │
│                                │
│    [▲ 閉じる]                 │
└────────────────────────────────┘
```

#### SCR-005: AI相談画面 (/consult)

**レイアウト**:
```
┌─────────────────────────────────┐
│ ← AIに相談する                  │
├─────────────────────────────────┤
│  [ケース情報カード]             │
│  発症タイプ: 突然の発症         │
│  現在地: 急性期病院             │
│  タスク進捗: 2/8件完了          │
├─────────────────────────────────┤
│  [推奨質問例]                   │
│  • 介護休業を取るべきか？       │
│  • 施設か自宅か迷っている       │
│  • 費用が心配                   │
├─────────────────────────────────┤
│  [チャット履歴]                 │
│  🙋 ユーザー:                   │
│     介護休業を取るべきですか？  │
│                                 │
│  🤖 AI:                         │
│     介護休業は「自分で介護する  │
│     ための休み」ではなく...     │
│                                 │
├─────────────────────────────────┤
│  [入力欄]                       │
│  💬 質問を入力...        [送信] │
└─────────────────────────────────┘
```

**機能**:
- ケース情報を自動的にコンテキストとして送信
- ストリーミング表示（文字が順次表示される）
- 会話履歴をローカルストレージに保存
- 推奨質問例をクリックで自動入力

---

## 9. API仕様

### 9.1 API一覧

| エンドポイント | メソッド | 説明 |
|----------------|----------|------|
| `/api/chat` | POST | Claude APIとの会話 |
| `/api/diagnosis` | POST | 診断ロジック実行（将来用） |

### 9.2 詳細API仕様

#### POST /api/chat

**リクエスト**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "介護休業を取るべきですか？"
    }
  ],
  "caseContext": {
    "onsetType": "sudden",
    "phase": "acute",
    "tasksCompleted": 2,
    "tasksTotal": 8
  }
}
```

**レスポンス**:
- Server-Sent Events (SSE) でストリーミング
- Content-Type: `text/event-stream`

```
data: {"type":"content_block_start","index":0}
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"介護休業は"}}
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"「自分で"}}
...
data: {"type":"message_stop"}
```

**エラーレスポンス**:
```json
{
  "error": "API Error",
  "details": "Rate limit exceeded"
}
```

---

## 10. デザインシステム

### 10.1 カラーパレット

```css
/* Primary Colors */
--primary: #2563eb;         /* メインブルー */
--primary-dark: #1e40af;    /* 濃いブルー */
--primary-light: #60a5fa;   /* 淡いブルー */

/* Accent Colors */
--accent: #fbbf24;          /* アクセントイエロー */
--accent-dark: #f59e0b;     /* 濃いイエロー */
--accent-light: #fef3c7;    /* 淡いイエロー */

/* Point Colors */
--point: #ef4444;           /* 優先度の赤 */
--point-light: #fecaca;     /* 淡い赤 */

/* Text Colors */
--text-dark: #1f2937;       /* メインテキスト */
--text: #374151;            /* 通常テキスト */
--text-muted: #6b7280;      /* グレーテキスト */

/* Background Colors */
--bg: #f9fafb;              /* 背景グレー */
--surface: #f3f4f6;         /* サーフェス */
--border: #e5e7eb;          /* ボーダー */
```

### 10.2 タイポグラフィ

```css
/* Font Families */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

/* Font Sizes */
text-2xl: 1.5rem;    /* 24px - ページタイトル */
text-xl: 1.25rem;    /* 20px - セクションタイトル */
text-lg: 1.125rem;   /* 18px - サブタイトル */
text-base: 1rem;     /* 16px - 本文 */
text-sm: 0.875rem;   /* 14px - 小さい本文 */
text-xs: 0.75rem;    /* 12px - キャプション */
```

### 10.3 コンポーネント

#### ボタン

```css
/* Primary Button */
.btn-primary {
  background: var(--accent);
  color: var(--primary-dark);
  font-weight: bold;
  padding: 0.75rem 2rem;
  border-radius: 0.75rem;
  transition: all 0.2s;
}
.btn-primary:hover {
  background: var(--accent-dark);
  color: white;
}

/* Secondary Button */
.btn-secondary {
  border: 2px solid var(--primary);
  color: var(--primary);
  padding: 0.75rem 2rem;
  border-radius: 0.75rem;
}
```

#### カード

```css
.card {
  background: white;
  border: 2px solid var(--border);
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.card-active {
  border-color: var(--primary);
  box-shadow: 0 4px 6px rgba(37,99,235,0.1);
}
```

#### バッジ

```css
.badge-priority {
  background: rgba(239, 68, 68, 0.1);
  color: var(--point);
  font-size: 0.625rem;
  font-weight: bold;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
}
```

### 10.4 アニメーション

```css
/* フェードイン */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}
```

### 10.5 レスポンシブデザイン

```css
/* Breakpoints */
sm: 640px;   /* モバイル横 */
md: 768px;   /* タブレット */
lg: 1024px;  /* デスクトップ */
xl: 1280px;  /* 大画面 */

/* Mobile First */
.container {
  max-width: 100%;
  padding: 1rem;
}

@media (min-width: 1024px) {
  .container {
    max-width: 1280px;
    padding: 1.5rem;
  }
}
```

---

## 11. 技術スタック

### 11.1 フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 16.1.6 | React フレームワーク（App Router） |
| React | 19.2.3 | UI ライブラリ |
| TypeScript | ^5 | 型安全性 |
| Tailwind CSS | ^4 | スタイリング |
| @line/liff | ^2.27.3 | LINE連携 |

### 11.2 バックエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js API Routes | - | サーバーサイドAPI |
| @anthropic-ai/sdk | ^0.73.0 | Claude AI統合 |
| @line/bot-sdk | ^10.6.0 | LINE Bot API（将来用） |

### 11.3 インフラ

| サービス | 用途 |
|---------|------|
| Vercel | ホスティング・デプロイ |
| GitHub | バージョン管理 |
| LINE Platform | LIFF・認証 |
| Anthropic API | AI相談機能 |

### 11.4 開発環境

```json
{
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
}
```

---

## 12. セキュリティ

### 12.1 認証・認可

**LIFF認証**:
- LINE IDでユーザーを識別
- アクセストークンの検証
- サーバーサイドでトークンをデコード

**API キー管理**:
- 環境変数で管理（`.env.local`）
- Vercel Environment Variables で本番環境に設定
- クライアントに公開しない（API Routes経由でのみ使用）

### 12.2 データ保護

**個人情報の取り扱い**:
- 診断結果はクライアントサイドのReact Contextのみで管理
- サーバーサイドには永続化しない（ステートレス）
- ローカルストレージには最小限の情報のみ保存

**通信の暗号化**:
- HTTPS必須
- Vercel の自動SSL証明書

### 12.3 脆弱性対策

**XSS対策**:
- Reactの自動エスケープ機能
- `dangerouslySetInnerHTML` の使用禁止

**CSRF対策**:
- LIFF認証によるトークン検証
- Same-Origin Policy

**APIレート制限**:
- Anthropic API側のレート制限に依存
- 将来的には独自のレート制限実装を検討

---

## 13. 今後の拡張性

### 13.1 機能拡張ロードマップ

#### Phase 1: MVP（現在）
- ✅ 最小診断・詳細診断
- ✅ リライフプラン生成
- ✅ タスク管理
- ✅ AI相談

#### Phase 2: 機能強化（3ヶ月以内）
- [ ] タスクのリマインダー通知（LINE Messaging API）
- [ ] 家族共有機能（招待リンク生成）
- [ ] プランのPDF出力
- [ ] タスクの並び替え・カスタマイズ

#### Phase 3: エコシステム拡張（6ヶ月以内）
- [ ] 施設検索API統合
- [ ] ケアマネージャー検索
- [ ] 自治体窓口データベース連携
- [ ] 想ひ人コンシェルジュ予約機能

#### Phase 4: パーソナライゼーション（1年以内）
- [ ] 地域別カスタマイズ
- [ ] ユーザー履歴に基づく推奨
- [ ] 家族会議ファシリテーション機能
- [ ] 動画ガイド統合

### 13.2 技術的負債

**現在の課題**:
- データの永続化がない（リロードで消える）
- ユーザー認証が簡易的
- テストコードの不足
- ドキュメントの整備

**対応計画**:
- データベース導入（Supabase / Firestore 検討）
- ユーザーアカウント管理システム
- E2Eテストの導入（Playwright / Cypress）
- API ドキュメント自動生成

### 13.3 スケーラビリティ

**現在の構成**:
- Vercel の Serverless Functions（自動スケール）
- Claude API のレート制限内で運用

**将来の対応**:
- キャッシング戦略（Redis 検討）
- APIゲートウェイ導入
- CDN最適化
- 画像・静的ファイルの最適化

---

## 14. 付録

### 14.1 用語集

| 用語 | 説明 |
|------|------|
| LIFF | LINE Front-end Framework。LINEアプリ内でWebアプリを動かす仕組み |
| MSW | Medical Social Worker。医療ソーシャルワーカー |
| 地域包括支援センター | 市区町村が設置する、介護に関する総合相談窓口 |
| ケアマネージャー | 介護支援専門員。ケアプランを作成する専門家 |
| 要介護認定 | 介護保険サービスを受けるための認定制度（要支援1-2、要介護1-5） |
| リライフプラン | このアプリが生成する、個別最適化された介護対応計画 |
| もしもナビ | 過去に開発された介護ナビゲーションサービスの名称 |
| ビジネスケアラー | 仕事をしながら介護をする人 |
| 生活PM | 生活プロジェクトマネージャー。想ひ人が提唱する概念 |

### 14.2 参考資料

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Anthropic Claude API Documentation](https://docs.anthropic.com/)
- [LINE Developers LIFF](https://developers.line.biz/ja/docs/liff/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### 14.3 関連ドキュメント

- `README.md`: プロジェクトセットアップガイド
- `docs/moshimo-navi/README.md`: もしもナビ構造の説明
- `src/lib/knowledge.ts`: AIシステムプロンプト（専門知識ベース）
- `MEMORY.md`: プロジェクトの学習メモ

---

**ドキュメント作成者**: Claude Code
**承認者**: -
**次回レビュー予定**: 2026年3月

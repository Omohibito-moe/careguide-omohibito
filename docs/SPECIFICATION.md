# ケアガイド（もしもナビ統合版）設計仕様書

## 0. プロダクト核（1文）

**最小診断で"現在地"を確定 → 簡易リライフプラン（フロー＋タスク）を即生成 → 詳細診断でプラン精緻化 → 既存タスクに「追記・置換・分解」して一元管理**

---

## 1. 画面一覧と画面ごとの役割

### 画面一覧

| # | 画面ID | パス | 画面名 | 役割 |
|---|--------|------|--------|------|
| 1 | `landing` | `/` | トップページ | プロダクト説明＋最小診断への導線（CTAボタン1つ） |
| 2 | `minimal-diagnosis` | `/diagnosis` | 最小診断 | 2問で「発生タイプ」と「現在地フェーズ」を特定する |
| 3 | `plan` | `/plan` | リライフプラン | 簡易版/詳細版を同一画面で表示。統合ホーム |
| 4 | `detailed-diagnosis` | `/diagnosis/detailed` | 詳細診断 | 制度適用・フロー分岐・タスク具体化のための追加質問 |
| 5 | `consult` | `/consult` | 相談導線 | ケース要約生成＋LINE遷移（補助導線） |

### 各画面の詳細仕様

#### 1. トップページ (`/`)

**役割**: 初見ユーザーが「これは自分のためのサービスだ」と認識し、最小診断を開始する

**表示要素**:
- ヘッダー: プロダクト名「ケアガイド」
- キャッチコピー: 「介護の始まりで迷わない。2つの質問で、あなたの"次の一手"がわかります」
- CTAボタン: 「いまの状況を診断する」（1つだけ）
- サブテキスト: 「所要時間：30秒」

**操作**:
- CTAボタン押下 → `/diagnosis` へ遷移

**置かないもの**:
- カテゴリ一覧（制度別ナビ）→ 詳細版で出す
- 相談ボタン → プラン画面で出す
- 費用計算 → MVP外

---

#### 2. 最小診断 (`/diagnosis`)

**役割**: 2問で「発生タイプ×現在地フェーズ」を確定し、簡易リライフプランを生成する

**Q1: 発生タイプ**

| 選択肢 | 値 | 説明テキスト |
|--------|----|------------|
| 突然の発症 | `sudden` | 脳卒中・心筋梗塞・骨折/転倒など |
| ゆるやかな変化 | `gradual` | 認知症・パーキンソン病・老化による衰えなど |

**Q2: 現在の状況（Q1の回答で選択肢が分岐）**

Q1 = `sudden`（突然の発症）の場合:

| 選択肢 | 値 |
|--------|----|
| 急性期病院に入院中 | `acute_hospital` |
| リハビリ病院に入院中 | `rehab_hospital` |
| 退院し自宅で療養中 | `home_after_discharge` |
| 退院し施設で療養中 | `facility_after_discharge` |
| 最初から入院していない | `no_hospitalization` |

Q1 = `gradual`（ゆるやかな変化）の場合:

| 選択肢 | 値 |
|--------|----|
| 異変を感じるが受診していない | `not_visited` |
| 受診しているが介護保険を申請していない | `visited_no_insurance` |
| 介護保険を使用して在宅介護中 | `home_care_with_insurance` |

**出力（診断結果 → プラン画面へ遷移）**:
- 現在地フェーズ（1行テキスト）
- 結論サマリー（1行テキスト）
- 優先タスク 3〜7件
- 最初に連絡すべき窓口（1つ）
- 詳細診断への導線テキスト

**操作**:
- Q1選択 → Q2表示
- Q2選択 → 診断実行 → `/plan` へ遷移

---

#### 3. リライフプラン (`/plan`)

**役割**: 統合ホーム。簡易版も詳細版もこの画面で表示。タスク管理の一元的な場所

**表示構成（3ブロック固定）**:

```
┌─────────────────────────────────────┐
│ ① 現在地フェーズ                      │
│    「急性期病院（入院0〜2週間）」       │
│    結論サマリー 1行                    │
│    最初に連絡すべき窓口                │
├─────────────────────────────────────┤
│ ② 次の一手（優先タスク一覧）           │
│    □ タスク1 [優先] 期限: 24時間以内   │
│    □ タスク2 [優先] 期限: 48時間以内   │
│    □ タスク3 [標準] 期限: 1週間以内    │
│    ...                               │
├─────────────────────────────────────┤
│ ③ 全体フロー（折りたたみ）             │
│    ▶ 急性期 → リハビリ → 退院準備      │
│      → 退院 → 在宅/施設 → 継続        │
└─────────────────────────────────────┘

CTA:
[プランを精密化する（詳細診断）]  ← /diagnosis/detailed へ
[AIに次の一手を確認する]          ← /consult へ
```

**簡易版 → 詳細版の差分**:

| 要素 | 簡易版 | 詳細版（アップグレード後） |
|------|--------|--------------------------|
| タスク | 3〜7件、概要レベル | 追記・置換・分解で精緻化済み |
| 制度カテゴリ | 非表示 | ブロック④として追加表示 |
| バッジ | 「簡易版」 | 「詳細版」 |

**詳細版で追加されるブロック④**:

```
┌─────────────────────────────────────┐
│ ④ 関連する制度・サービス              │
│                                      │
│  [介護保険] ★あなたに関係あり          │
│    ・要介護認定申請 → タスク#3へ       │
│    ・居宅介護支援                     │
│                                      │
│  [医療]                              │
│    ・高額療養費制度 → タスク#5へ       │
│                                      │
│  [自治体] ★あなたに関係あり           │
│    ・紙おむつ支給                     │
│                                      │
│  [経済的支援]                         │
│    ・介護休業給付金                   │
│                                      │
│  [民間サービス]                       │
│    ・配食サービス                     │
│                                      │
│  [障害福祉]                          │
│    ・（該当なし）                     │
└─────────────────────────────────────┘
```

**タスク操作**:
- チェックボックスで完了/未完了を切り替え
- 各タスクをタップ → 詳細表示（説明・必要書類・窓口・テンプレリンク）

---

#### 4. 詳細診断 (`/diagnosis/detailed`)

**役割**: 制度適用可能性の精緻化、フロー分岐条件の特定、タスクの具体化

**前提条件**: 最小診断が完了していること（Plan が存在すること）

**設問（段階式: 3問 → 追加3問 → 追加4問）**

**ステップ1（3問）: 本人の状態**

| # | 質問 | 選択肢 |
|---|------|--------|
| D1 | 要介護認定の状況 | 未申請 / 申請中 / 認定済み（要支援1-2 / 要介護1-5） |
| D2 | 医療依存度 | なし / 通院のみ / 医療処置あり（経管栄養・吸引・透析等） |
| D3 | 認知症の有無と程度 | なし / 軽度（物忘れ）/ 中等度（見守り必要）/ 重度（常時介助） |

**ステップ2（3問）: 家族・生活環境**

| # | 質問 | 選択肢 |
|---|------|--------|
| D4 | 主介護者の就労状況 | フルタイム / パート / 無職 / 自営 |
| D5 | 同居家族の有無 | 独居 / 配偶者のみ / 子と同居 / その他家族 |
| D6 | 住居の状況 | 持ち家（戸建て）/ 持ち家（マンション）/ 賃貸 / 同居先 |

**ステップ3（4問）: 経済・意思・地域**

| # | 質問 | 選択肢 |
|---|------|--------|
| D7 | 経済的な不安 | ない / 少しある / 大きい |
| D8 | 退院後の住まい希望 | 自宅 / 施設 / まだ決められない |
| D9 | 障害者手帳の有無 | なし / あり / 該当するかわからない |
| D10 | 自治体の介護相談窓口に連絡済みか | はい / いいえ / わからない |

**各ステップ完了時の動作**:
- ステップ1完了 → 「さらに精緻化しますか？」で継続/終了を選択可能
- ステップ2完了 → 同上
- ステップ3完了 → 詳細診断完了

**出力**: 既存プランの「アップグレード」（新プランは生成しない）

---

#### 5. 相談導線 (`/consult`)

**役割**: 行き詰まった時の補助。AIに「次の一手」を確認する導線

**表示要素**:
- 現在のケース要約（自動生成）
  - 発生タイプ / 現在地 / 完了済みタスク数 / 未完了タスク数
- 「LINEで相談する」ボタン
  - ケース要約をクエリパラメータでLINEに引き渡す

**LINE側の応答フォーマット（固定）**:
1. 要約（あなたの状況の整理）
2. 追加質問（最大2問）
3. 次の一手（3つ）

---

## 2. ユーザーフロー図

```
[トップページ]
    │
    ▼ 「いまの状況を診断する」
[最小診断]
    │ Q1: 突然の発症 / ゆるやかな変化
    │ Q2: 現在の状況（Q1で分岐）
    ▼
[リライフプラン（簡易版）]  ◄─── 統合ホーム
    │
    ├──── タスク操作（チェック完了/詳細表示）
    │
    ├──── 「プランを精密化する」
    │         │
    │         ▼
    │     [詳細診断]
    │         │ Step1: 本人の状態（3問）
    │         │   └─ 「続ける」or「ここで反映」
    │         │ Step2: 家族・生活環境（3問）
    │         │   └─ 「続ける」or「ここで反映」
    │         │ Step3: 経済・意思・地域（4問）
    │         ▼
    │     [タスクマージ実行]
    │         │ enrich（追記）/ replace（置換）/ split（分解）
    │         ▼
    │     [リライフプラン（詳細版）]  ◄─── 同じ画面がアップグレード
    │         │
    │         ├── 制度カテゴリ表示（④ブロック追加）
    │         └── タスクが精緻化済み
    │
    └──── 「AIに次の一手を確認する」
              │
              ▼
          [相談導線]
              │ ケース要約生成
              ▼
          [LINE遷移]
              │ 自由記述OK
              ▼
          [AI応答（固定フォーマット）]
              ├ 要約
              ├ 追加質問（最大2問）
              └ 次の一手（3つ）
```

### 状態遷移図

```
[未診断] ──Q1+Q2──► [簡易プラン生成済み] ──詳細診断──► [詳細プラン反映済み]
                          │                                   │
                          └─── タスク操作 ◄───────────────────┘
                                  │
                                  ├── チェック完了
                                  ├── 詳細表示
                                  └── テンプレDL
```

### Plan の状態

```
plan.version:  "minimal"  ───詳細診断完了──►  "detailed"
plan.tasks:    3〜7件             enrich/replace/split で更新
```

---

## 3. データモデル

### 3-1. Diagnosis（診断結果）

```typescript
type OnsetType = "sudden" | "gradual";

// 突然の発症の現在地
type SuddenSituation =
  | "acute_hospital"        // 急性期病院に入院中
  | "rehab_hospital"        // リハビリ病院に入院中
  | "home_after_discharge"  // 退院し自宅で療養中
  | "facility_after_discharge" // 退院し施設で療養中
  | "no_hospitalization";   // 最初から入院していない

// ゆるやかな変化の現在地
type GradualSituation =
  | "not_visited"             // 異変を感じるが受診していない
  | "visited_no_insurance"    // 受診しているが介護保険未申請
  | "home_care_with_insurance"; // 介護保険を使用して在宅介護中

type Situation = SuddenSituation | GradualSituation;

// フェーズ（診断結果から導出）
type Phase =
  | "acute"           // 急性期
  | "rehab"           // リハビリ期
  | "discharge_prep"  // 退院準備
  | "post_discharge"  // 退院後
  | "discovery"       // 病気発見
  | "medical_visit"   // 受診
  | "prevention"      // 介護予防
  | "home_care";      // 在宅介護

interface MinimalDiagnosis {
  id: string;
  onsetType: OnsetType;
  situation: Situation;
  phase: Phase;
  createdAt: string; // ISO 8601
}

// 詳細診断
type CareLevel = "not_applied" | "applying" | "support_1" | "support_2"
  | "care_1" | "care_2" | "care_3" | "care_4" | "care_5";

type MedicalDependency = "none" | "outpatient" | "medical_procedures";
type DementiaLevel = "none" | "mild" | "moderate" | "severe";
type EmploymentStatus = "fulltime" | "parttime" | "unemployed" | "self_employed";
type LivingArrangement = "alone" | "spouse_only" | "with_children" | "other_family";
type HousingType = "owned_house" | "owned_apartment" | "rental" | "cohabitation";
type FinancialConcern = "none" | "slight" | "significant";
type PostDischargePreference = "home" | "facility" | "undecided";
type DisabilityCard = "none" | "yes" | "unknown";
type ContactedOffice = "yes" | "no" | "unknown";

interface DetailedDiagnosisInput {
  // Step 1: 本人の状態
  careLevel?: CareLevel;
  medicalDependency?: MedicalDependency;
  dementiaLevel?: DementiaLevel;
  // Step 2: 家族・生活環境
  employmentStatus?: EmploymentStatus;
  livingArrangement?: LivingArrangement;
  housingType?: HousingType;
  // Step 3: 経済・意思・地域
  financialConcern?: FinancialConcern;
  postDischargePreference?: PostDischargePreference;
  disabilityCard?: DisabilityCard;
  contactedOffice?: ContactedOffice;
}

interface DetailedDiagnosis extends DetailedDiagnosisInput {
  id: string;
  minimalDiagnosisId: string; // 紐づく最小診断のID
  completedSteps: number; // 1, 2, or 3
  createdAt: string;
}
```

### 3-2. Task（タスク）

```typescript
type TaskStatus = "todo" | "done";
type TaskSource = "minimal" | "detailed" | "manual";
type TaskPriority = "high" | "normal";
type MergeAction = "enrich" | "replace" | "split";

type TaskDeadline =
  | "immediate"     // 即時
  | "within_24h"    // 24時間以内
  | "within_48h"    // 48時間以内
  | "within_72h"    // 72時間以内
  | "within_1week"  // 1週間以内
  | "within_2weeks" // 2週間以内
  | "within_1month" // 1ヶ月以内
  | "ongoing";      // 継続

interface Task {
  taskId: string;          // 永続ID（UUID）
  title: string;
  description: string;
  status: TaskStatus;
  source: TaskSource;
  priority: TaskPriority;
  deadline: TaskDeadline;
  parentTaskId: string | null;  // split時に親タスクを参照
  // 詳細診断で追記される情報
  documents?: string[];         // 必要書類
  contactOffice?: string;       // 窓口
  templateLinks?: string[];     // テンプレリンク
  relatedServiceCategory?: ServiceCategory; // 関連制度カテゴリ
  // メタ情報
  archivedAt?: string;          // replace時にアーカイブされた日時
  mergedFrom?: {                // マージ履歴
    action: MergeAction;
    sourceTaskId: string;
    mergedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

### 3-3. Plan（リライフプラン）

```typescript
type PlanVersion = "minimal" | "detailed";
type ServiceCategory =
  | "care_insurance"   // 介護保険
  | "medical"          // 医療
  | "municipal"        // 自治体独自
  | "private"          // 民間サービス
  | "financial"        // 経済的支援
  | "disability";      // 障害福祉

interface ServiceEligibility {
  category: ServiceCategory;
  serviceName: string;
  isLikelyEligible: boolean;   // あなたに関係ありフラグ
  linkedTaskId?: string;        // 対応タスクへのリンク
  description: string;
}

interface Plan {
  planId: string;
  version: PlanVersion;
  // 診断情報
  minimalDiagnosisId: string;
  detailedDiagnosisId?: string;
  // 現在地
  phase: Phase;
  phaseLabelJa: string;         // 「急性期病院（入院0〜2週間）」
  conclusionSummary: string;    // 結論サマリー（1行）
  firstContact: string;         // 最初に連絡すべき窓口
  // タスク
  tasks: Task[];
  archivedTasks: Task[];        // replace で差し替えられた旧タスク
  // フロー
  flowSteps: FlowStep[];
  // 制度（詳細版のみ）
  serviceEligibilities?: ServiceEligibility[];
  // メタ
  createdAt: string;
  updatedAt: string;
}

interface FlowStep {
  stepId: string;
  label: string;                // 「急性期病院」
  description: string;          // 「入院0〜72時間〜2週間」
  isCurrent: boolean;           // 現在地かどうか
  order: number;
}
```

---

## 4. タスクマージ仕様（具体例付き）

### ルール

詳細診断後に生成されるタスクは、**必ず**既存タスクに対して以下のいずれかで反映する。
新規リストの独立生成は**禁止**。

### 4-1. enrich（追記）

**定義**: 既存タスクの `description`、`documents`、`contactOffice`、`templateLinks` を追加・更新する。`taskId` は変更しない。

**具体例**:

```
【簡易版タスク（before）】
taskId: "t-001"
title: "介護保険の申請をする"
description: "市区町村の窓口で介護保険の申請を行います"
source: "minimal"
documents: undefined
contactOffice: undefined

    ↓ enrich ↓

【詳細版タスク（after）】
taskId: "t-001"  ← 同じID
title: "介護保険の申請をする"
description: "市区町村の窓口で介護保険の申請を行います。主治医意見書が必要です。申請から認定まで約30日かかります。"
source: "minimal"  ← sourceは変えない
documents: ["介護保険申請書", "主治医意見書", "健康保険証のコピー"]
contactOffice: "○○市 高齢福祉課（TEL: xxx-xxxx）"
templateLinks: ["/templates/care-insurance-application"]
relatedServiceCategory: "care_insurance"
mergedFrom: { action: "enrich", sourceTaskId: "t-001", mergedAt: "..." }
```

### 4-2. replace（置換）

**定義**: 簡易タスクをアーカイブし、より正確な詳細タスクに差し替える。旧タスクの `taskId` を引き継ぐ。

**具体例**:

```
【簡易版タスク（before）】
taskId: "t-003"
title: "退院後の生活場所を決める"
description: "在宅か施設か、方針を決めましょう"
source: "minimal"

    ↓ replace ↓

【旧タスク → アーカイブ】
taskId: "t-003"
archivedAt: "2025-01-15T10:00:00Z"

【新タスク（差し替え）】
taskId: "t-003"  ← 同じIDを引き継ぐ
title: "在宅介護の準備をする（医療処置対応）"
description: "医療依存度が高いため、訪問看護ステーションの手配が必要です。ケアマネージャーと相談し、在宅医療体制を整えましょう。"
source: "detailed"
documents: ["訪問看護指示書", "在宅療養計画書"]
contactOffice: "地域包括支援センター"
mergedFrom: { action: "replace", sourceTaskId: "t-003", mergedAt: "..." }
```

### 4-3. split（分解）

**定義**: 簡易タスク1つを詳細タスク複数に分割する。親タスクは「まとめ」として残し、子タスクの全完了で親も完了になる。

**具体例**:

```
【簡易版タスク（before）】
taskId: "t-002"
title: "入院中に確認すべきことを整理する"
description: "入院中に、今後の方針について病院と相談しましょう"
source: "minimal"
parentTaskId: null

    ↓ split ↓

【親タスク（まとめとして残る）】
taskId: "t-002"
title: "入院中に確認すべきことを整理する"
status: "todo"  ← 子が全部doneになったらdoneに自動更新
source: "minimal"

【子タスク1】
taskId: "t-002-1"
title: "主治医に退院時期の見込みを確認する"
description: "退院の目安、必要なリハビリ期間、退院後の医療処置について確認"
source: "detailed"
parentTaskId: "t-002"  ← 親を参照
priority: "high"
deadline: "within_48h"

【子タスク2】
taskId: "t-002-2"
title: "医療ソーシャルワーカー（MSW）に面談を依頼する"
description: "退院後の生活・制度利用について相談。介護保険申請の代行可否も確認"
source: "detailed"
parentTaskId: "t-002"
priority: "high"
deadline: "within_72h"

【子タスク3】
taskId: "t-002-3"
title: "家族で退院後の方針を話し合う"
description: "在宅か施設か、介護の分担、費用について家族会議を行う"
source: "detailed"
parentTaskId: "t-002"
priority: "normal"
deadline: "within_1week"
templateLinks: ["/templates/family-meeting-agenda"]
```

### マージ判定ロジック

```
for each detailedTask:
  matchingTask = findBestMatch(plan.tasks, detailedTask)
  if matchingTask exists:
    if detailedTask only adds info → enrich(matchingTask, detailedTask)
    if detailedTask fundamentally changes scope → replace(matchingTask, detailedTask)
    if detailedTask breaks into multiple → split(matchingTask, detailedTasks[])
  else:
    // 既存タスクに該当なし → enrich不可 → 最も近い親タスクの子として追加
    addAsChild(closestParent, detailedTask)
```

---

## 5. MVP実装範囲 / 後回し機能

### MVP（v0.1）に含める

| # | 機能 | 理由 |
|---|------|------|
| 1 | トップページ | 導線の入口 |
| 2 | 最小診断（2問） | 核体験の入口 |
| 3 | 簡易リライフプラン生成 | 核体験そのもの |
| 4 | タスク管理（チェック完了/詳細表示） | 行動可能な状態の実現 |
| 5 | 全体フロー表示 | 見通しの提供 |
| 6 | 詳細診断（10問・段階式） | プラン精緻化の手段 |
| 7 | タスクマージエンジン（enrich/replace/split） | 一元管理の核ロジック |
| 8 | 詳細版プラン表示（制度カテゴリ付き） | 詳細診断の成果物 |

### 後回し（v0.2以降）

| # | 機能 | 理由 |
|---|------|------|
| 1 | LINE相談連携 | 補助導線。MVP検証に不要 |
| 2 | 介護費用の算出 | 複雑度が高く、MVPが膨らむ |
| 3 | 将来に備えたい（preparedness）診断 | セカンダリターゲット向け |
| 4 | テンプレートDL機能 | リンク表示で代替可能 |
| 5 | ユーザーアカウント/ログイン | ローカルストレージで代替 |
| 6 | 有料機能（有人相談/報告テンプレ/代行） | ビジネスモデル検証はMVP後 |

### MVP検証の成功基準

1. 最小診断完了率 > 80%（2問なので離脱は少ないはず）
2. タスク1つ以上チェック完了率 > 50%（行動につながった証拠）
3. 詳細診断への遷移率 > 30%（プラン精緻化の需要確認）

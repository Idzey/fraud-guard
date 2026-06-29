export const vFeatureNames = [
  "V1",
  "V2",
  "V3",
  "V4",
  "V5",
  "V6",
  "V7",
  "V8",
  "V9",
  "V10",
  "V11",
  "V12",
  "V13",
  "V14",
  "V15",
  "V16",
  "V17",
  "V18",
  "V19",
  "V20",
  "V21",
  "V22",
  "V23",
  "V24",
  "V25",
  "V26",
  "V27",
  "V28",
] as const;

export type VFeature = (typeof vFeatureNames)[number];
export type FeatureName = "Time" | VFeature | "Amount";
export const transactionFeatureNames = ["Time", ...vFeatureNames, "Amount"] as const;

export interface DatasetInfo {
  rows: number;
  feature_count: number;
  fraud_count: number;
  normal_count: number;
  fraud_percentage: number;
}

export type DatasetRow = Record<FeatureName | "Class", number>;

export interface DatasetPreview {
  rows: DatasetRow[];
}

export interface DatasetSample {
  id: string;
  title: string;
  description: string;
  expected_class: 0 | 1;
  payload: PredictionPayload;
}

export interface DatasetSamples {
  samples: DatasetSample[];
}

export interface ConfusionMatrix {
  true_negative: number;
  false_positive: number;
  false_negative: number;
  true_positive: number;
}

export interface CurvePoint {
  x: number;
  y: number;
}

export interface ModelMetric {
  model: string;
  roc_auc: number;
  precision: number;
  recall: number;
  f1: number;
  accuracy: number;
  pr_auc: number;
  confusion_matrix: ConfusionMatrix;
  roc_curve: CurvePoint[];
  precision_recall_curve: CurvePoint[];
}

export interface FeatureImportance {
  feature: FeatureName;
  importance: number;
}

export interface FeatureImportanceSet {
  model: string;
  features: FeatureImportance[];
}

export interface TrainResponse {
  status: "success" | string;
  trained_models: string[];
}

export type PredictionPayload = {
  Time: number;
  Amount: number;
} & Record<VFeature, number>;

export interface PredictionResponse {
  prediction: number;
  probability: number;
  risk: "Low" | "Medium" | "High";
  explanation: PredictionExplanation;
}

export interface FeatureContribution {
  feature: FeatureName;
  value: number;
  importance: number;
  contribution: number;
  reason: string;
}

export interface PredictionExplanation {
  model: string;
  method: string;
  summary: string;
  top_factors: FeatureContribution[];
}

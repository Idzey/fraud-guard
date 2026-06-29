import { apiClient } from "@/api/client";
import type {
  DatasetInfo,
  DatasetPreview,
  DatasetSamples,
  FeatureImportanceSet,
  ModelMetric,
  PredictionPayload,
  PredictionResponse,
  TrainResponse,
} from "@/types/api";

export async function getHealth() {
  const response = await apiClient.get<{ status: string }>("/health");
  return response.data;
}

export async function getDatasetInfo(): Promise<DatasetInfo> {
  const response = await apiClient.get<DatasetInfo>("/dataset/info");
  return response.data;
}

export async function getDatasetPreview(): Promise<DatasetPreview> {
  const response = await apiClient.get<DatasetPreview>("/dataset/preview");
  return response.data;
}

export async function getDatasetSamples(): Promise<DatasetSamples> {
  const response = await apiClient.get<DatasetSamples>("/dataset/samples");
  return response.data;
}

export async function trainModels(): Promise<TrainResponse> {
  const response = await apiClient.post<TrainResponse>("/models/train");
  return response.data;
}

export async function getModelMetrics(): Promise<ModelMetric[]> {
  const response = await apiClient.get<ModelMetric[]>("/models/metrics");
  return response.data;
}

export async function getBestModel(): Promise<ModelMetric | null> {
  try {
    const response = await apiClient.get<ModelMetric>("/models/best");
    return response.data;
  } catch (error) {
    if (typeof error === "object" && error !== null && "response" in error) {
      const status = (error as { response?: { status?: number } }).response?.status;
      if (status === 404) {
        return null;
      }
    }
    throw error;
  }
}

export async function getFeatureImportance(): Promise<FeatureImportanceSet[]> {
  const response = await apiClient.get<FeatureImportanceSet[]>("/models/feature-importance");
  return response.data;
}

export async function predictFraud(payload: PredictionPayload): Promise<PredictionResponse> {
  const response = await apiClient.post<PredictionResponse>("/predict", payload);
  return response.data;
}

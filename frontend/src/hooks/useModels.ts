import { useCallback, useEffect, useMemo, useState } from "react";

import { getFeatureImportance, getModelMetrics } from "@/api/fraudApi";
import type { FeatureImportanceSet, ModelMetric } from "@/types/api";
import { useAsyncData } from "./useAsyncData";

export type SortMetricKey = "roc_auc" | "precision" | "recall" | "f1" | "accuracy" | "pr_auc";

export interface ModelsData {
  metrics: ModelMetric[];
  featureImportance: FeatureImportanceSet[];
}

export function useModels() {
  const [sortKey, setSortKey] = useState<SortMetricKey>("roc_auc");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const loader = useCallback(async (): Promise<ModelsData> => {
    const [metrics, featureImportance] = await Promise.all([
      getModelMetrics(),
      getFeatureImportance(),
    ]);
    return { metrics, featureImportance };
  }, []);

  const state = useAsyncData(loader, [loader]);

  useEffect(() => {
    const firstModel = state.data?.metrics[0]?.model;
    if (firstModel && !state.data?.metrics.some((metric) => metric.model === selectedModel)) {
      setSelectedModel(firstModel);
    }
  }, [selectedModel, state.data?.metrics]);

  const sortedMetrics = useMemo(() => {
    return [...(state.data?.metrics ?? [])].sort((left, right) => right[sortKey] - left[sortKey]);
  }, [sortKey, state.data?.metrics]);

  const currentMetric = useMemo(
    () => sortedMetrics.find((metric) => metric.model === selectedModel) ?? sortedMetrics[0] ?? null,
    [selectedModel, sortedMetrics],
  );

  const currentImportance = useMemo(() => {
    return (
      state.data?.featureImportance.find((item) => item.model === currentMetric?.model)?.features ??
      []
    );
  }, [currentMetric?.model, state.data?.featureImportance]);

  return {
    ...state,
    sortKey,
    setSortKey,
    selectedModel,
    setSelectedModel,
    sortedMetrics,
    currentMetric,
    currentImportance,
  };
}


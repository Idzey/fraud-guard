import { useCallback } from "react";

import { getBestModel, getDatasetInfo, getModelMetrics } from "@/api/fraudApi";
import type { DatasetInfo, ModelMetric } from "@/types/api";
import { useAsyncData } from "./useAsyncData";

export interface DashboardData {
  info: DatasetInfo;
  metrics: ModelMetric[];
  best: ModelMetric | null;
}

export function useDashboardData() {
  const loader = useCallback(async (): Promise<DashboardData> => {
    const [info, metrics, best] = await Promise.all([
      getDatasetInfo(),
      getModelMetrics(),
      getBestModel(),
    ]);
    return { info, metrics, best };
  }, []);

  return useAsyncData(loader, [loader]);
}


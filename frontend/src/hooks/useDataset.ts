import { useCallback } from "react";

import { getDatasetInfo, getDatasetPreview } from "@/api/fraudApi";
import type { DatasetInfo, DatasetPreview } from "@/types/api";
import { useAsyncData } from "./useAsyncData";

export interface DatasetData {
  info: DatasetInfo;
  preview: DatasetPreview;
}

export function useDataset() {
  const loader = useCallback(async (): Promise<DatasetData> => {
    const [info, preview] = await Promise.all([getDatasetInfo(), getDatasetPreview()]);
    return { info, preview };
  }, []);

  return useAsyncData(loader, [loader]);
}


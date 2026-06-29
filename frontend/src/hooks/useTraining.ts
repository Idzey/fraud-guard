import { useState } from "react";

import { getApiErrorMessage } from "@/api/client";
import { trainModels } from "@/api/fraudApi";
import type { TrainResponse } from "@/types/api";

export function useTraining(onSuccess?: () => void | Promise<void>) {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingError, setTrainingError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<TrainResponse | null>(null);

  async function runTraining() {
    setIsTraining(true);
    setTrainingError(null);
    try {
      const result = await trainModels();
      setLastResult(result);
      await onSuccess?.();
    } catch (error) {
      setTrainingError(getApiErrorMessage(error));
    } finally {
      setIsTraining(false);
    }
  }

  return { isTraining, lastResult, trainingError, runTraining };
}


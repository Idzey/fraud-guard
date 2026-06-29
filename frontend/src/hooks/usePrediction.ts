import { useState } from "react";

import { getApiErrorMessage } from "@/api/client";
import { predictFraud } from "@/api/fraudApi";
import type { FeatureName, PredictionPayload, PredictionResponse } from "@/types/api";
import { vFeatureNames } from "@/types/api";

export function createEmptyPrediction(): PredictionPayload {
  const payload: Partial<PredictionPayload> = {
    Time: 0,
    Amount: 0,
  };

  for (const feature of vFeatureNames) {
    payload[feature] = 0;
  }

  return payload as PredictionPayload;
}

export function usePrediction() {
  const [form, setForm] = useState<PredictionPayload>(() => createEmptyPrediction());
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: FeatureName, value: number) {
    setForm((current) => ({ ...current, [field]: Number.isFinite(value) ? value : 0 }));
  }

  function resetForm() {
    setForm(createEmptyPrediction());
    setResult(null);
    setError(null);
  }

  async function submit() {
    setIsSubmitting(true);
    setError(null);
    try {
      const prediction = await predictFraud(form);
      setResult(prediction);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    form,
    result,
    error,
    isSubmitting,
    updateField,
    resetForm,
    submit,
  };
}

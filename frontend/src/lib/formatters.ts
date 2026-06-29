import type { BadgeProps } from "@/components/ui/badge";
import type { PredictionResponse } from "@/types/api";

const EMPTY_VALUE = "—";

export function formatNumber(value?: number | null, fractionDigits = 0): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return EMPTY_VALUE;
  }

  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatPercent(value?: number | null, fractionDigits = 2): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return EMPTY_VALUE;
  }

  return `${formatNumber(value * 100, fractionDigits)}%`;
}

export function formatRatio(value?: number | null, fractionDigits = 4): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return EMPTY_VALUE;
  }

  return formatNumber(value, fractionDigits);
}

export function riskBadgeVariant(
  risk?: PredictionResponse["risk"],
): NonNullable<BadgeProps["variant"]> {
  if (risk === "High") {
    return "danger";
  }
  if (risk === "Medium") {
    return "warning";
  }
  return "success";
}

export function formatRiskLabel(risk?: PredictionResponse["risk"]): string {
  if (risk === "High") {
    return "Высокий";
  }
  if (risk === "Medium") {
    return "Средний";
  }
  if (risk === "Low") {
    return "Низкий";
  }
  return EMPTY_VALUE;
}

export function formatPredictionClass(prediction: number): string {
  return prediction === 1 ? "Мошенническая" : "Обычная";
}


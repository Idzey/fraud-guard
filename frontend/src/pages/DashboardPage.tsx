import { BrainCircuit, Database, Percent, Play, RefreshCw, ShieldAlert } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ErrorAlert } from "@/components/ErrorAlert";
import { LoadingCards } from "@/components/LoadingCards";
import { MetricCard } from "@/components/MetricCard";
import { PageHeader } from "@/components/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useTraining } from "@/hooks/useTraining";
import { formatNumber, formatPercent, formatRatio } from "@/lib/formatters";

const classColors = ["#19b47a", "#f0526b"];

export function DashboardPage() {
  const { data, error, isLoading, reload } = useDashboardData();
  const training = useTraining(reload);

  const info = data?.info;
  const best = data?.best;
  const metrics = data?.metrics ?? [];
  const classDistribution = info
    ? [
        { name: "Обычные", value: info.normal_count },
        { name: "Мошеннические", value: info.fraud_count },
      ]
    : [];
  const metricsChart = metrics.map((metric) => ({
    model: metric.model,
    roc_auc: Number((metric.roc_auc * 100).toFixed(2)),
    f1: Number((metric.f1 * 100).toFixed(2)),
  }));

  return (
    <div>
      <PageHeader
        title="Обзор"
        description="Быстрая оценка состояния Dataset, доли мошенничества и качества ML-моделей."
        action={
          <>
            <Button variant="outline" onClick={() => void reload()} disabled={isLoading || training.isTraining}>
              <RefreshCw className="size-4" />
              Обновить
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => void training.runTraining()} disabled={training.isTraining}>
                  <Play className="size-4" />
                  {training.isTraining ? "Обучение..." : "Обучить модели"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Запустить обучение Random Forest, XGBoost, CatBoost и Isolation Forest</TooltipContent>
            </Tooltip>
          </>
        }
      />

      {error ? <ErrorAlert message={error} /> : null}
      {training.trainingError ? <div className="mt-3"><ErrorAlert message={training.trainingError} /></div> : null}

      {isLoading ? (
        <LoadingCards />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Всего транзакций"
            value={formatNumber(info?.rows)}
            description={`${formatNumber(info?.feature_count)} признаков`}
            icon={Database}
          />
          <MetricCard
            title="Доля мошенничества"
            value={`${formatNumber(info?.fraud_percentage, 2)}%`}
            description={`${formatNumber(info?.fraud_count)} операций Class = 1`}
            icon={Percent}
            tone="rose"
          />
          <MetricCard
            title="Лучшая модель"
            value={best?.model ?? "—"}
            description={best ? "Выбор по ROC-AUC" : "Модели еще не обучены"}
            icon={BrainCircuit}
            tone="sky"
          />
          <MetricCard
            title="ROC-AUC"
            value={best ? formatRatio(best.roc_auc, 4) : "—"}
            description={best ? `PR-AUC ${formatRatio(best.pr_auc, 4)}` : "Нет метрик"}
            icon={ShieldAlert}
            tone="amber"
          />
        </div>
      )}

      {training.lastResult ? (
        <Alert variant="success" className="mt-3">
          <AlertTitle>Обучение завершено</AlertTitle>
          <AlertDescription>Модели обучены: {training.lastResult.trained_models.join(", ")}.</AlertDescription>
        </Alert>
      ) : null}

      {!isLoading && !metrics.length ? (
        <Alert className="mt-3">
          <AlertTitle>Метрики пока не рассчитаны</AlertTitle>
          <AlertDescription>
            Нажмите «Обучить модели», чтобы backend рассчитал метрики и сохранил артефакты в папку models.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-3 grid gap-3 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Распределение Class</CardTitle>
              <CardDescription>Обычные и мошеннические транзакции</CardDescription>
            </div>
            <Badge variant="danger">Class imbalance</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={64}
                    outerRadius={96}
                    paddingAngle={3}
                  >
                    {classDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={classColors[index % classColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    contentStyle={{ background: "#111214", border: "1px solid rgba(255,255,255,.08)" }}
                    formatter={(value) => formatNumber(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-[var(--text-3)]">
              <span className="inline-flex items-center gap-1.5">
                <i className="size-2 rounded-sm bg-[var(--normal)]" /> normal
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="size-2 rounded-sm bg-[var(--risk)]" /> fraud
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Сравнение моделей</CardTitle>
              <CardDescription>ROC-AUC и F1-score после обучения</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {metricsChart.length ? (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metricsChart} margin={{ left: 0, right: 12, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                    <XAxis dataKey="model" tick={{ fill: "#8a8f98", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#8a8f98", fontSize: 12 }} domain={[0, 100]} />
                    <ChartTooltip
                      contentStyle={{ background: "#111214", border: "1px solid rgba(255,255,255,.08)" }}
                      formatter={(value) => `${formatNumber(Number(value), 2)}%`}
                    />
                    <Bar dataKey="roc_auc" fill="#7170ff" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="f1" fill="#19b47a" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="grid min-h-[280px] place-items-center text-center">
                <div>
                  <div className="text-sm font-semibold text-[var(--text-2)]">Модели еще не обучены</div>
                  <p className="mt-2 max-w-md text-[13px] leading-5 text-[var(--text-3)]">
                    После обучения здесь появится сравнение Random Forest, XGBoost, CatBoost и Isolation Forest.
                  </p>
                </div>
              </div>
            )}
            {best ? (
              <p className="mt-2 text-xs text-[var(--text-3)]">
                Лидер: {best.model}, ROC-AUC {formatPercent(best.roc_auc)}.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


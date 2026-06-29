import { BrainCircuit, Database, Percent, Play, ShieldAlert } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useTraining } from "@/hooks/useTraining";
import { formatNumber, formatPercent, formatRatio } from "@/lib/formatters";

const classColors = ["#14b8a6", "#f43f5e"];

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
        title="Обзор Fraud Detection"
        description="Сводка по транзакциям, доле мошенничества и качеству моделей машинного обучения."
        action={
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => void training.runTraining()} disabled={training.isTraining}>
                <Play className="size-4" />
                {training.isTraining ? "Обучение..." : "Обучить модели"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Запустить обучение Random Forest, XGBoost, CatBoost и Isolation Forest</TooltipContent>
          </Tooltip>
        }
      />

      {error ? <ErrorAlert message={error} /> : null}
      {training.trainingError ? <div className="mt-4"><ErrorAlert message={training.trainingError} /></div> : null}

      {isLoading ? (
        <LoadingCards />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Транзакции"
            value={formatNumber(info?.rows)}
            description={`${formatNumber(info?.feature_count)} признаков в матрице данных`}
            icon={Database}
            tone="teal"
          />
          <MetricCard
            title="Доля мошенничества"
            value={`${formatNumber(info?.fraud_percentage, 2)}%`}
            description={`${formatNumber(info?.fraud_count)} подозрительных операций`}
            icon={Percent}
            tone="rose"
          />
          <MetricCard
            title="Лучшая модель"
            value={best?.model ?? "Нет обучения"}
            description="Выбор по максимальному ROC-AUC"
            icon={BrainCircuit}
            tone="sky"
          />
          <MetricCard
            title="ROC-AUC"
            value={best ? formatRatio(best.roc_auc, 4) : "—"}
            description={best ? `PR-AUC ${formatRatio(best.pr_auc, 4)}` : "Запустите обучение моделей"}
            icon={ShieldAlert}
            tone="amber"
          />
        </div>
      )}

      {training.lastResult ? (
        <Alert variant="success" className="mt-5">
          <AlertTitle>Обучение завершено</AlertTitle>
          <AlertDescription>
            Модели обучены: {training.lastResult.trained_models.join(", ")}.
          </AlertDescription>
        </Alert>
      ) : null}

      {!isLoading && !metrics.length ? (
        <Alert className="mt-5">
          <AlertTitle>Метрики пока не рассчитаны</AlertTitle>
          <AlertDescription>
            Нажмите «Обучить модели», чтобы backend обучил модели и сохранил артефакты в папку models.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Мошеннические и обычные</CardTitle>
            <CardDescription>Распределение классов в датасете</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={68}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {classDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={classColors[index % classColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    contentStyle={{ background: "#111827", border: "1px solid #334155" }}
                    formatter={(value) => formatNumber(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Качество моделей</CardTitle>
            <CardDescription>ROC-AUC и F1-score после обучения</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metricsChart} margin={{ left: 0, right: 12, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="model" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} domain={[0, 100]} />
                  <ChartTooltip
                    contentStyle={{ background: "#111827", border: "1px solid #334155" }}
                    formatter={(value) => `${formatNumber(Number(value), 2)}%`}
                  />
                  <Bar dataKey="roc_auc" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="f1" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {best ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Лидер: {best.model}, ROC-AUC {formatPercent(best.roc_auc)}.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

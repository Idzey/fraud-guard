import { BarChart3, Eye, Play, RefreshCw } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ErrorAlert } from "@/components/ErrorAlert";
import { PageHeader } from "@/components/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useModels, type SortMetricKey } from "@/hooks/useModels";
import { useTraining } from "@/hooks/useTraining";
import { formatNumber, formatPercent, formatRatio } from "@/lib/formatters";

const sortOptions: { value: SortMetricKey; label: string }[] = [
  { value: "roc_auc", label: "ROC-AUC" },
  { value: "pr_auc", label: "PR-AUC" },
  { value: "f1", label: "F1-score" },
  { value: "recall", label: "Recall" },
  { value: "precision", label: "Precision" },
  { value: "accuracy", label: "Accuracy" },
];

export function ModelsPage() {
  const models = useModels();
  const training = useTraining(models.reload);
  const currentMetric = models.currentMetric;
  const importanceData = models.currentImportance.map((item) => ({
    feature: item.feature,
    importance: Number((item.importance * 100).toFixed(3)),
  }));
  const rocData =
    currentMetric?.roc_curve.map((point) => ({
      fpr: point.x,
      tpr: point.y,
    })) ?? [];
  const prData =
    currentMetric?.precision_recall_curve.map((point) => ({
      recall: point.x,
      precision: point.y,
    })) ?? [];

  return (
    <div>
      <PageHeader
        title="Модели"
        description="Сравнение ML-моделей, диагностика качества и просмотр Confusion Matrix."
        action={
          <>
            <Select value={models.sortKey} onValueChange={(value) => models.setSortKey(value as SortMetricKey)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => void training.runTraining()} disabled={training.isTraining}>
                  {training.isTraining ? <RefreshCw className="size-4 animate-spin" /> : <Play className="size-4" />}
                  {training.isTraining ? "Обучение..." : "Обучить модели"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Переобучить все модели и обновить метрики</TooltipContent>
            </Tooltip>
          </>
        }
      />

      {models.error ? <ErrorAlert message={models.error} /> : null}
      {training.trainingError ? <div className="mt-3"><ErrorAlert message={training.trainingError} /></div> : null}

      {models.isLoading ? (
        <Skeleton className="h-80 w-full rounded-lg" />
      ) : models.sortedMetrics.length ? (
        <div className="grid gap-3 xl:grid-cols-[1fr_0.8fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Таблица моделей</CardTitle>
                <CardDescription>Сортировка по выбранной метрике</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="table-shell subtle-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead>ROC-AUC</TableHead>
                      <TableHead>Precision</TableHead>
                      <TableHead>Recall</TableHead>
                      <TableHead>F1-score</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>PR-AUC</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {models.sortedMetrics.map((metric, index) => (
                      <TableRow
                        key={metric.model}
                        className={metric.model === currentMetric?.model ? "bg-white/[0.035]" : undefined}
                        onClick={() => models.setSelectedModel(metric.model)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={index === 0 ? "success" : "secondary"}>{index + 1}</Badge>
                            <span className="font-medium text-[var(--text-2)]">{metric.model}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatRatio(metric.roc_auc)}</TableCell>
                        <TableCell>{formatRatio(metric.precision)}</TableCell>
                        <TableCell>{formatRatio(metric.recall)}</TableCell>
                        <TableCell>{formatRatio(metric.f1)}</TableCell>
                        <TableCell>{formatRatio(metric.accuracy)}</TableCell>
                        <TableCell>{formatRatio(metric.pr_auc)}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  models.setSelectedModel(metric.model);
                                }}
                              >
                                <Eye className="size-4" />
                                Matrix
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{metric.model}</DialogTitle>
                                <DialogDescription>Confusion Matrix на тестовой выборке</DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  ["True Negative", metric.confusion_matrix.true_negative, "text-foreground"],
                                  ["False Positive", metric.confusion_matrix.false_positive, "text-amber-100"],
                                  ["False Negative", metric.confusion_matrix.false_negative, "text-rose-100"],
                                  ["True Positive", metric.confusion_matrix.true_positive, "text-emerald-100"],
                                ].map(([label, value, color]) => (
                                  <div key={label} className="rounded-lg border border-border bg-white/[0.025] p-3">
                                    <span className="text-xs text-[var(--text-4)]">{label}</span>
                                    <b className={`mt-3 block text-2xl font-medium ${color}`}>
                                      {formatNumber(Number(value))}
                                    </b>
                                  </div>
                                ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>{currentMetric?.model ?? "Выбранная модель"}</CardTitle>
                <CardDescription>Ключевые показатели выбранной модели</CardDescription>
              </div>
              <Select value={currentMetric?.model ?? ""} onValueChange={models.setSelectedModel}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Выберите модель" />
                </SelectTrigger>
                <SelectContent>
                  {models.sortedMetrics.map((metric) => (
                    <SelectItem key={metric.model} value={metric.model}>
                      {metric.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {currentMetric ? (
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {[
                    ["ROC-AUC", currentMetric.roc_auc],
                    ["Recall", currentMetric.recall],
                    ["PR-AUC", currentMetric.pr_auc],
                    ["Precision", currentMetric.precision],
                    ["F1-score", currentMetric.f1],
                    ["Accuracy", currentMetric.accuracy],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-md border border-white/[0.05] bg-white/[0.018] p-2.5">
                      <span className="block text-[11px] text-[var(--text-4)]">{label}</span>
                      <b className="mt-1.5 block text-lg font-medium tabular-nums">
                        {formatPercent(Number(value))}
                      </b>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Alert>
          <BarChart3 className="size-4" />
          <AlertTitle>Нет обученных моделей</AlertTitle>
          <AlertDescription>Запустите обучение, чтобы получить метрики и графики.</AlertDescription>
        </Alert>
      )}

      <Card className="mt-3">
        <CardHeader>
          <div>
            <CardTitle>Диагностика модели</CardTitle>
            <CardDescription>Feature Importance, ROC Curve и Precision-Recall Curve</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="importance">
            <TabsList>
              <TabsTrigger value="importance">Feature Importance</TabsTrigger>
              <TabsTrigger value="roc">ROC Curve</TabsTrigger>
              <TabsTrigger value="pr">Precision-Recall Curve</TabsTrigger>
            </TabsList>

            <TabsContent value="importance">
              <div className="h-96 p-3.5">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={importanceData} layout="vertical" margin={{ left: 30, right: 16, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                    <XAxis type="number" tick={{ fill: "#8a8f98", fontSize: 12 }} />
                    <YAxis dataKey="feature" type="category" tick={{ fill: "#8a8f98", fontSize: 12 }} width={64} />
                    <ChartTooltip
                      contentStyle={{ background: "#111214", border: "1px solid rgba(255,255,255,.08)" }}
                      formatter={(value) => `${formatNumber(Number(value), 3)}%`}
                    />
                    <Bar dataKey="importance" fill="#7170ff" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="roc">
              <div className="h-96 p-3.5">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rocData} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                    <XAxis dataKey="fpr" tick={{ fill: "#8a8f98", fontSize: 12 }} domain={[0, 1]} />
                    <YAxis tick={{ fill: "#8a8f98", fontSize: 12 }} domain={[0, 1]} />
                    <ChartTooltip contentStyle={{ background: "#111214", border: "1px solid rgba(255,255,255,.08)" }} />
                    <Line type="monotone" dataKey="tpr" stroke="#7170ff" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="pr">
              <div className="h-96 p-3.5">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prData} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                    <XAxis dataKey="recall" tick={{ fill: "#8a8f98", fontSize: 12 }} domain={[0, 1]} />
                    <YAxis tick={{ fill: "#8a8f98", fontSize: 12 }} domain={[0, 1]} />
                    <ChartTooltip contentStyle={{ background: "#111214", border: "1px solid rgba(255,255,255,.08)" }} />
                    <Line type="monotone" dataKey="precision" stroke="#19b47a" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}


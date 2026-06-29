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
        description="Сравнение моделей, метрики классификации, feature importance и диагностические кривые."
        action={
          <div className="flex flex-wrap items-center gap-2">
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
          </div>
        }
      />

      {models.error ? <ErrorAlert message={models.error} /> : null}
      {training.trainingError ? <div className="mt-4"><ErrorAlert message={training.trainingError} /></div> : null}

      {models.isLoading ? (
        <Skeleton className="h-80 w-full rounded-lg" />
      ) : models.sortedMetrics.length ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Метрики</CardTitle>
              <CardDescription>Сортировка по выбранной метрике</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Модель</TableHead>
                    <TableHead>ROC-AUC</TableHead>
                    <TableHead>Precision</TableHead>
                    <TableHead>Recall</TableHead>
                    <TableHead>F1</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>PR-AUC</TableHead>
                    <TableHead>Детали</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.sortedMetrics.map((metric, index) => (
                    <TableRow
                      key={metric.model}
                      className={metric.model === currentMetric?.model ? "bg-primary/10" : undefined}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={index === 0 ? "success" : "secondary"}>{index + 1}</Badge>
                          <span className="font-medium">{metric.model}</span>
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
                              onClick={() => models.setSelectedModel(metric.model)}
                            >
                              <Eye className="size-4" />
                              Матрица
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{metric.model}</DialogTitle>
                              <DialogDescription>Confusion Matrix на тестовой выборке</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border text-center">
                              <div className="border-b border-r border-border p-5">
                                <div className="text-sm text-muted-foreground">True Negative</div>
                                <div className="mt-2 text-2xl font-semibold">
                                  {formatNumber(metric.confusion_matrix.true_negative)}
                                </div>
                              </div>
                              <div className="border-b border-border p-5">
                                <div className="text-sm text-muted-foreground">False Positive</div>
                                <div className="mt-2 text-2xl font-semibold text-amber-200">
                                  {formatNumber(metric.confusion_matrix.false_positive)}
                                </div>
                              </div>
                              <div className="border-r border-border p-5">
                                <div className="text-sm text-muted-foreground">False Negative</div>
                                <div className="mt-2 text-2xl font-semibold text-rose-200">
                                  {formatNumber(metric.confusion_matrix.false_negative)}
                                </div>
                              </div>
                              <div className="p-5">
                                <div className="text-sm text-muted-foreground">True Positive</div>
                                <div className="mt-2 text-2xl font-semibold text-primary">
                                  {formatNumber(metric.confusion_matrix.true_positive)}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Выбранная модель</CardTitle>
              <CardDescription>Модель для графиков и матрицы ошибок</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={currentMetric?.model ?? ""} onValueChange={models.setSelectedModel}>
                <SelectTrigger>
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

              {currentMetric ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-background/40 p-4">
                    <div className="text-xs text-muted-foreground">ROC-AUC</div>
                    <div className="mt-2 text-xl font-semibold">{formatPercent(currentMetric.roc_auc)}</div>
                  </div>
                  <div className="rounded-lg border border-border bg-background/40 p-4">
                    <div className="text-xs text-muted-foreground">F1-score</div>
                    <div className="mt-2 text-xl font-semibold">{formatPercent(currentMetric.f1)}</div>
                  </div>
                  <div className="rounded-lg border border-border bg-background/40 p-4">
                    <div className="text-xs text-muted-foreground">Recall</div>
                    <div className="mt-2 text-xl font-semibold">{formatPercent(currentMetric.recall)}</div>
                  </div>
                  <div className="rounded-lg border border-border bg-background/40 p-4">
                    <div className="text-xs text-muted-foreground">Precision</div>
                    <div className="mt-2 text-xl font-semibold">{formatPercent(currentMetric.precision)}</div>
                  </div>
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

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Диагностика модели</CardTitle>
          <CardDescription>Feature importance, ROC Curve и Precision-Recall Curve</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="importance">
            <TabsList className="flex h-auto flex-wrap justify-start">
              <TabsTrigger value="importance">Feature Importance</TabsTrigger>
              <TabsTrigger value="roc">ROC Curve</TabsTrigger>
              <TabsTrigger value="pr">Precision Recall</TabsTrigger>
            </TabsList>

            <TabsContent value="importance">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={importanceData} layout="vertical" margin={{ left: 30, right: 16, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                    <YAxis dataKey="feature" type="category" tick={{ fill: "#cbd5e1", fontSize: 12 }} width={64} />
                    <ChartTooltip
                      contentStyle={{ background: "#111827", border: "1px solid #334155" }}
                      formatter={(value) => `${formatNumber(Number(value), 3)}%`}
                    />
                    <Bar dataKey="importance" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="roc">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rocData} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="fpr" tick={{ fill: "#cbd5e1", fontSize: 12 }} domain={[0, 1]} />
                    <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} domain={[0, 1]} />
                    <ChartTooltip contentStyle={{ background: "#111827", border: "1px solid #334155" }} />
                    <Line type="monotone" dataKey="tpr" stroke="#14b8a6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="pr">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prData} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="recall" tick={{ fill: "#cbd5e1", fontSize: 12 }} domain={[0, 1]} />
                    <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} domain={[0, 1]} />
                    <ChartTooltip contentStyle={{ background: "#111827", border: "1px solid #334155" }} />
                    <Line type="monotone" dataKey="precision" stroke="#f59e0b" strokeWidth={2} dot={false} />
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

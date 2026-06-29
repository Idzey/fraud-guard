import { Info, PlayCircle, RotateCcw, Send } from "lucide-react";
import type { FormEvent } from "react";

import { ErrorAlert } from "@/components/ErrorAlert";
import { PageHeader } from "@/components/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePrediction } from "@/hooks/usePrediction";
import { formatNumber, formatPredictionClass, formatRiskLabel, riskBadgeVariant } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { transactionFeatureNames, type FeatureName } from "@/types/api";

export function PredictPage() {
  const prediction = usePrediction();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void prediction.submit();
  }

  return (
    <div>
      <PageHeader
        title="Предсказание"
        description="Выберите реальную тестовую транзакцию из Dataset или введите признаки вручную. Ответ и объяснение рассчитывает backend /predict."
        action={
          <Button variant="outline" onClick={prediction.resetForm} type="button">
            <RotateCcw className="size-4" />
            Сбросить
          </Button>
        }
      />

      {prediction.error ? <ErrorAlert message={prediction.error} /> : null}

      <div className="grid gap-3 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-3">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Транзакция</CardTitle>
                <CardDescription>Time, Amount и V1-V28</CardDescription>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
                  {transactionFeatureNames.map((field) => (
                    <label key={field} className="grid gap-1.5 text-xs">
                      <span className="font-medium text-[var(--text-4)]">{field}</span>
                      <Input
                        type="number"
                        step="any"
                        value={prediction.form[field as FeatureName]}
                        onChange={(event) =>
                          prediction.updateField(field as FeatureName, Number(event.currentTarget.value))
                        }
                      />
                    </label>
                  ))}
                </div>
              </CardContent>
              <div className="flex flex-wrap justify-end gap-2 border-t border-white/[0.05] p-3.5">
                <Button type="button" variant="outline" onClick={prediction.resetForm}>
                  <RotateCcw className="size-4" />
                  Сбросить
                </Button>
                <Button type="submit" disabled={prediction.isSubmitting}>
                  <Send className="size-4" />
                  {prediction.isSubmitting ? "Предсказание..." : "Оценить риск мошенничества"}
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Тестовые транзакции</CardTitle>
                <CardDescription>Реальные строки из creditcard.csv, чтобы не вводить V1-V28 вручную</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {prediction.samplesError ? <ErrorAlert message={prediction.samplesError} /> : null}

              {prediction.isSamplesLoading ? (
                <div className="grid gap-2 md:grid-cols-3">
                  <Skeleton className="h-36" />
                  <Skeleton className="h-36" />
                  <Skeleton className="h-36" />
                </div>
              ) : (
                <div className="grid gap-2 md:grid-cols-2 2xl:grid-cols-3">
                  {prediction.samples.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => prediction.applySample(sample)}
                      className={cn(
                        "flex min-h-44 flex-col rounded-lg border border-white/[0.05] bg-white/[0.018] p-4 text-left transition-colors hover:border-white/15 hover:bg-white/[0.035]",
                        prediction.selectedSampleId === sample.id && "border-primary/45 bg-primary/10",
                      )}
                    >
                      <div className="grid gap-2">
                        <span className="text-base font-semibold leading-6 text-[var(--text-2)]">
                          {sample.title}
                        </span>
                        <Badge variant={sample.expected_class === 1 ? "danger" : "success"} className="w-fit">
                          Class = {sample.expected_class}
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[var(--text-3)]">{sample.description}</p>
                      <div className="mt-auto flex items-center gap-2 pt-4 text-sm text-[var(--text-4)]">
                        <PlayCircle className="size-4" />
                        Заполнить форму
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <p className="mt-3 text-sm leading-6 text-[var(--text-4)]">
                Эти карточки не подменяют результат. Они только берут реальные значения из Dataset. Итоговый класс,
                probability и вкладка «Почему такой риск» всегда приходят из обученной backend-модели.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Результат prediction</CardTitle>
              <CardDescription>Вероятность, класс и объяснение решения</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {prediction.result ? (
              <Tabs defaultValue="result">
                <TabsList>
                  <TabsTrigger value="result">Итог</TabsTrigger>
                  <TabsTrigger value="why">Почему такой риск</TabsTrigger>
                </TabsList>

                <TabsContent value="result">
                  <div className="grid gap-4 p-3.5">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <div className="text-xs font-medium text-[var(--text-4)]">
                          Вероятность мошенничества
                        </div>
                        <div className="mt-2 text-[34px] font-medium leading-none tracking-normal">
                          {formatNumber(prediction.result.probability * 100, 0)}%
                        </div>
                      </div>
                      <Badge variant={riskBadgeVariant(prediction.result.risk)}>
                        {formatRiskLabel(prediction.result.risk)}
                      </Badge>
                    </div>
                    <Progress value={prediction.result.probability * 100} />
                    <div className="flex items-center justify-between gap-3 border-t border-white/[0.05] pt-3 text-[13px] text-[var(--text-3)]">
                      <span>Итоговая классификация</span>
                      <Badge variant={prediction.result.prediction === 1 ? "danger" : "success"}>
                        {formatPredictionClass(prediction.result.prediction)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-white/[0.05] pt-3 text-[13px] text-[var(--text-3)]">
                      <span>Модель</span>
                      <span className="text-[var(--text-2)]">{prediction.result.explanation.model}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-white/[0.05] pt-3 text-[13px] text-[var(--text-3)]">
                      <span>Probability</span>
                      <span className="num text-[var(--text-2)]">
                        {formatNumber(prediction.result.probability, 6)}
                      </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="why">
                  <div className="grid gap-3 p-3.5">
                    <Alert variant={prediction.result.prediction === 1 ? "destructive" : "success"}>
                      <Info className="size-4" />
                      <AlertTitle>{prediction.result.explanation.summary}</AlertTitle>
                      <AlertDescription>
                        Метод: {prediction.result.explanation.method}.
                      </AlertDescription>
                    </Alert>

                    <div className="rounded-lg border border-white/[0.05]">
                      <div className="grid grid-cols-[0.7fr_0.7fr_0.8fr] gap-2 border-b border-white/[0.05] px-3 py-2 text-[11px] uppercase text-[var(--text-4)]">
                        <span>Признак</span>
                        <span>Значение</span>
                        <span>Вклад</span>
                      </div>
                      {prediction.result.explanation.top_factors.map((factor) => (
                        <div key={factor.feature} className="border-b border-white/[0.05] px-3 py-2 last:border-b-0">
                          <div className="grid grid-cols-[0.7fr_0.7fr_0.8fr] items-center gap-2">
                            <span className="font-medium text-[var(--text-2)]">{factor.feature}</span>
                            <span className="num text-[var(--text-3)]">{formatNumber(factor.value, 4)}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={factor.contribution * 100} className="h-2" />
                              <span className="w-12 text-right text-xs text-[var(--text-3)]">
                                {formatNumber(factor.contribution * 100, 1)}%
                              </span>
                            </div>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-[var(--text-3)]">{factor.reason}</p>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs leading-5 text-[var(--text-4)]">
                      Для V1-V28 нельзя дать бизнес-расшифровку исходного поля, потому что признаки анонимизированы в
                      Kaggle Dataset. Поэтому приложение показывает отклонение PCA-признаков и их вклад в оценку.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="grid min-h-[320px] place-items-center p-3.5 text-center">
                <div>
                  <div className="text-sm font-semibold text-[var(--text-2)]">Результата еще нет</div>
                  <p className="mt-2 max-w-sm text-[13px] leading-5 text-[var(--text-3)]">
                    Выберите реальную тестовую транзакцию или заполните форму вручную. После ответа API появится
                    вкладка с объяснением.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { RotateCcw, Send } from "lucide-react";
import type { FormEvent } from "react";

import { ErrorAlert } from "@/components/ErrorAlert";
import { PageHeader } from "@/components/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { usePrediction } from "@/hooks/usePrediction";
import { formatNumber, formatPredictionClass, formatRiskLabel, riskBadgeVariant } from "@/lib/formatters";
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
        description="Оценка вероятности мошенничества для одной банковской транзакции."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={prediction.resetForm} type="button">
              <RotateCcw className="size-4" />
              Сбросить
            </Button>
          </div>
        }
      />

      {prediction.error ? <ErrorAlert message={prediction.error} /> : null}

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Признаки транзакции</CardTitle>
            <CardDescription>Time, Amount и PCA-признаки V1-V28</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-3 md:grid-cols-2">
                {(["Time", "Amount"] as const).map((field) => (
                  <label key={field} className="grid gap-2 text-sm">
                    <span className="font-medium">{field}</span>
                    <Input
                      type="number"
                      step="any"
                      value={prediction.form[field]}
                      onChange={(event) =>
                        prediction.updateField(field, Number(event.currentTarget.value))
                      }
                    />
                  </label>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {transactionFeatureNames
                  .filter((field): field is FeatureName => field !== "Time" && field !== "Amount")
                  .map((field) => (
                    <label key={field} className="grid gap-2 text-sm">
                      <span className="font-medium">{field}</span>
                      <Input
                        type="number"
                        step="any"
                        value={prediction.form[field]}
                        onChange={(event) =>
                          prediction.updateField(field, Number(event.currentTarget.value))
                        }
                      />
                    </label>
                  ))}
              </div>

              <Button type="submit" disabled={prediction.isSubmitting} className="w-full md:w-auto">
                <Send className="size-4" />
                {prediction.isSubmitting ? "Предсказание..." : "Оценить риск мошенничества"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Результат предсказания</CardTitle>
              <CardDescription>Вероятность и уровень риска</CardDescription>
            </CardHeader>
            <CardContent>
              {prediction.result ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Риск</div>
                      <div className="mt-2 text-3xl font-semibold">
                        {formatRiskLabel(prediction.result.risk)}
                      </div>
                    </div>
                    <Badge variant={riskBadgeVariant(prediction.result.risk)}>
                      {formatPredictionClass(prediction.result.prediction)}
                    </Badge>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Вероятность мошенничества</span>
                      <span className="font-medium">
                        {formatNumber(prediction.result.probability * 100, 2)}%
                      </span>
                    </div>
                    <Progress value={prediction.result.probability * 100} />
                  </div>
                  <Alert
                    variant={
                      prediction.result.risk === "High"
                        ? "destructive"
                        : prediction.result.risk === "Medium"
                          ? "warning"
                          : "success"
                    }
                  >
                    <AlertTitle>{formatRiskLabel(prediction.result.risk)} риск</AlertTitle>
                    <AlertDescription>
                      Вероятность: {formatNumber(prediction.result.probability, 6)}
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="flex min-h-56 items-center justify-center rounded-lg border border-dashed border-border text-center text-sm text-muted-foreground">
                  Результат появится после отправки формы.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { Database, ListChecks, Percent, ShieldAlert } from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
} from "recharts";

import { ErrorAlert } from "@/components/ErrorAlert";
import { LoadingCards } from "@/components/LoadingCards";
import { MetricCard } from "@/components/MetricCard";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDataset } from "@/hooks/useDataset";
import { formatNumber } from "@/lib/formatters";
import { transactionFeatureNames, type DatasetRow } from "@/types/api";

const classColors = ["#19b47a", "#f0526b"];
const tableColumns = [...transactionFeatureNames, "Class"] as const;

function formatCell(row: DatasetRow, column: (typeof tableColumns)[number]) {
  const value = row[column];
  if (column === "Class") {
    return value;
  }
  if (column === "Time") {
    return formatNumber(value);
  }
  if (column === "Amount") {
    return formatNumber(value, 2);
  }
  return formatNumber(value, 4);
}

export function DatasetPage() {
  const { data, error, isLoading } = useDataset();
  const info = data?.info;
  const classDistribution = info
    ? [
        { name: "Обычные", value: info.normal_count },
        { name: "Мошеннические", value: info.fraud_count },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title="Датасет"
        description="Проверка структуры creditcard.csv, распределения Class и первых строк транзакций."
      />

      {error ? <ErrorAlert message={error} /> : null}

      {isLoading ? (
        <LoadingCards />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Строки" value={formatNumber(info?.rows)} description="source CSV" icon={Database} />
          <MetricCard
            title="Признаки"
            value={formatNumber(info?.feature_count)}
            description="Time, V1-V28, Amount"
            icon={ListChecks}
            tone="sky"
          />
          <MetricCard
            title="fraud"
            value={formatNumber(info?.fraud_count)}
            description={`${formatNumber(info?.fraud_percentage, 2)}% от Dataset`}
            icon={ShieldAlert}
            tone="rose"
          />
          <MetricCard
            title="normal"
            value={formatNumber(info?.normal_count)}
            description="Class = 0"
            icon={Percent}
            tone="teal"
          />
        </div>
      )}

      <div className="mt-3 grid gap-3 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Распределение Class</CardTitle>
              <CardDescription>Баланс нормальных и мошеннических транзакций</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={classDistribution} dataKey="value" nameKey="name" outerRadius={104}>
                    {classDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={classColors[index % classColors.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <ChartTooltip
                    contentStyle={{ background: "#111214", border: "1px solid rgba(255,255,255,.08)" }}
                    formatter={(value) => formatNumber(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Структура признаков</CardTitle>
              <CardDescription>Dataset анонимизирован, V1-V28 выглядят как PCA-признаки</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-md border border-white/[0.05] bg-white/[0.018] p-3">
                <span className="text-[11px] text-[var(--text-4)]">Явные поля</span>
                <b className="mt-1 block text-sm font-medium">Time, Amount</b>
              </div>
              <div className="rounded-md border border-white/[0.05] bg-white/[0.018] p-3">
                <span className="text-[11px] text-[var(--text-4)]">Анонимизированные</span>
                <b className="mt-1 block text-sm font-medium">V1-V28</b>
              </div>
              <div className="rounded-md border border-white/[0.05] bg-white/[0.018] p-3">
                <span className="text-[11px] text-[var(--text-4)]">Target</span>
                <b className="mt-1 block text-sm font-medium">Class</b>
              </div>
            </div>
            <p className="mt-4 text-[13px] leading-6 text-[var(--text-3)]">
              Таблица ниже ограничена первыми 20 строками и использует horizontal scroll, чтобы 30+ колонок не
              ломали layout.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-3">
        <CardHeader>
          <div>
            <CardTitle>Первые 20 строк Dataset</CardTitle>
            <CardDescription>Time, V1-V28, Amount, Class</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="table-shell subtle-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  {tableColumns.map((column) => (
                    <TableHead key={column} className="min-w-20">
                      {column}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.preview.rows ?? []).map((row, rowIndex) => (
                  <TableRow key={`${row.Time}-${rowIndex}`}>
                    {tableColumns.map((column) => (
                      <TableCell key={column}>
                        {column === "Class" ? (
                          <Badge variant={row.Class === 1 ? "danger" : "success"}>
                            {row.Class === 1 ? "Мошенническая" : "Обычная"}
                          </Badge>
                        ) : (
                          formatCell(row, column)
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


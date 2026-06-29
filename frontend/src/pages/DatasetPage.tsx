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

const classColors = ["#14b8a6", "#f43f5e"];
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
  return formatNumber(value, 3);
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
        description="Просмотр структуры creditcard.csv, статистики и первых строк транзакций."
      />

      {error ? <ErrorAlert message={error} /> : null}

      {isLoading ? (
        <LoadingCards />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Строки"
            value={formatNumber(info?.rows)}
            description="Количество транзакций"
            icon={Database}
          />
          <MetricCard
            title="Признаки"
            value={formatNumber(info?.feature_count)}
            description="Time, Amount и V1-V28"
            icon={ListChecks}
            tone="sky"
          />
          <MetricCard
            title="Мошеннические"
            value={formatNumber(info?.fraud_count)}
            description={`${formatNumber(info?.fraud_percentage, 2)}% от датасета`}
            icon={ShieldAlert}
            tone="rose"
          />
          <MetricCard
            title="Обычные"
            value={formatNumber(info?.normal_count)}
            description="Обычные транзакции"
            icon={Percent}
            tone="amber"
          />
        </div>
      )}

      <div className="mt-6 grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>Распределение классов</CardTitle>
            <CardDescription>Баланс нормальных и мошеннических транзакций</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={classDistribution} dataKey="value" nameKey="name" outerRadius={108}>
                    {classDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={classColors[index % classColors.length]} />
                    ))}
                  </Pie>
                  <Legend />
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
            <CardTitle>Предпросмотр датасета</CardTitle>
            <CardDescription>Первые 20 строк CSV</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[28rem] overflow-auto rounded-lg border border-border">
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
                        <TableCell key={column} className="whitespace-nowrap">
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
    </div>
  );
}

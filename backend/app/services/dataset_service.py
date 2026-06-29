from functools import cached_property
from pathlib import Path
from typing import Any

from app.ml.preprocessing import FEATURE_COLUMNS, TARGET_COLUMN, read_creditcard_csv
from app.schemas.dataset import DatasetInfo, DatasetPreview, DatasetSample, DatasetSamples


class DatasetService:
    """Loads and summarizes the credit card transaction dataset."""

    def __init__(self, dataset_path: Path) -> None:
        self.dataset_path = dataset_path

    @cached_property
    def dataframe(self):
        return read_creditcard_csv(self.dataset_path)

    def reload(self) -> None:
        self.__dict__.pop("dataframe", None)

    def get_info(self) -> DatasetInfo:
        dataframe = self.dataframe
        rows = len(dataframe)
        fraud_count = int(dataframe[TARGET_COLUMN].sum())
        normal_count = int(rows - fraud_count)
        fraud_percentage = round((fraud_count / rows * 100) if rows else 0.0, 4)

        return DatasetInfo(
            rows=rows,
            feature_count=len(FEATURE_COLUMNS),
            fraud_count=fraud_count,
            normal_count=normal_count,
            fraud_percentage=fraud_percentage,
        )

    def get_preview(self, limit: int = 20) -> DatasetPreview:
        records: list[dict[str, Any]] = self.dataframe.head(limit).to_dict(orient="records")
        return DatasetPreview(rows=records)

    def get_samples(self) -> DatasetSamples:
        dataframe = self.dataframe
        normal_rows = dataframe[dataframe[TARGET_COLUMN] == 0]
        fraud_rows = dataframe[dataframe[TARGET_COLUMN] == 1]

        samples: list[DatasetSample] = []
        if not normal_rows.empty:
            samples.append(
                self._make_sample(
                    sample_id="normal-real",
                    title="Реальная обычная операция",
                    description="Строка из датасета с Class = 0. Удобна для проверки низкого риска.",
                    row=normal_rows.iloc[0],
                )
            )

        if not fraud_rows.empty:
            samples.append(
                self._make_sample(
                    sample_id="fraud-real",
                    title="Реальная мошенническая операция",
                    description="Строка из датасета с Class = 1. Используй ее, чтобы проверить fraud-сценарий.",
                    row=fraud_rows.iloc[0],
                )
            )
            samples.append(
                self._make_sample(
                    sample_id="fraud-high-amount",
                    title="Мошенническая операция с высокой суммой",
                    description="Fraud-строка с максимальным Amount среди мошеннических транзакций.",
                    row=fraud_rows.sort_values("Amount", ascending=False).iloc[0],
                )
            )

        return DatasetSamples(samples=samples)

    def _make_sample(self, sample_id: str, title: str, description: str, row) -> DatasetSample:
        payload = {feature: float(row[feature]) for feature in FEATURE_COLUMNS}
        return DatasetSample(
            id=sample_id,
            title=title,
            description=description,
            expected_class=int(row[TARGET_COLUMN]),
            payload=payload,
        )

from functools import cached_property
from pathlib import Path
from typing import Any

from app.ml.preprocessing import FEATURE_COLUMNS, TARGET_COLUMN, read_creditcard_csv
from app.schemas.dataset import DatasetInfo, DatasetPreview


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

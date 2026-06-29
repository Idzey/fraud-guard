from typing import Any

from pydantic import BaseModel, Field


class DatasetInfo(BaseModel):
    rows: int
    feature_count: int
    fraud_count: int
    normal_count: int
    fraud_percentage: float = Field(ge=0, le=100)


class DatasetPreview(BaseModel):
    rows: list[dict[str, Any]]


class DatasetSample(BaseModel):
    id: str
    title: str
    description: str
    expected_class: int
    payload: dict[str, float]


class DatasetSamples(BaseModel):
    samples: list[DatasetSample]

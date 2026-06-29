from pydantic import BaseModel, Field, create_model


class ConfusionMatrix(BaseModel):
    true_negative: int
    false_positive: int
    false_negative: int
    true_positive: int


class CurvePoint(BaseModel):
    x: float
    y: float


class ModelMetric(BaseModel):
    model: str
    roc_auc: float
    precision: float
    recall: float
    f1: float
    accuracy: float
    pr_auc: float
    confusion_matrix: ConfusionMatrix
    roc_curve: list[CurvePoint] = Field(default_factory=list)
    precision_recall_curve: list[CurvePoint] = Field(default_factory=list)


class FeatureImportance(BaseModel):
    feature: str
    importance: float


class FeatureImportanceSet(BaseModel):
    model: str
    features: list[FeatureImportance]


class TrainResponse(BaseModel):
    status: str
    trained_models: list[str]


_prediction_fields = {
    "Time": (float, Field(default=0)),
    "Amount": (float, Field(default=0)),
}
_prediction_fields.update(
    {f"V{index}": (float, Field(default=0)) for index in range(1, 29)}
)

PredictionRequest = create_model("PredictionRequest", **_prediction_fields)


class PredictionResponse(BaseModel):
    prediction: int
    probability: float
    risk: str


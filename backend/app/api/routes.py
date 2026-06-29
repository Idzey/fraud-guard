from fastapi import APIRouter, Depends, HTTPException

from app.api.dependencies import get_dataset_service, get_prediction_service, get_training_service
from app.schemas.common import StatusResponse
from app.schemas.dataset import DatasetInfo, DatasetPreview
from app.schemas.ml import (
    FeatureImportanceSet,
    ModelMetric,
    PredictionRequest,
    PredictionResponse,
    TrainResponse,
)
from app.services.dataset_service import DatasetService
from app.services.prediction_service import PredictionService
from app.services.training_service import TrainingService


router = APIRouter()


@router.get("/health", response_model=StatusResponse)
def health() -> StatusResponse:
    return StatusResponse(status="ok")


@router.get("/dataset/info", response_model=DatasetInfo)
def dataset_info(service: DatasetService = Depends(get_dataset_service)) -> DatasetInfo:
    return service.get_info()


@router.get("/dataset/preview", response_model=DatasetPreview)
def dataset_preview(service: DatasetService = Depends(get_dataset_service)) -> DatasetPreview:
    return service.get_preview()


@router.post("/models/train", response_model=TrainResponse)
def train_models(service: TrainingService = Depends(get_training_service)) -> TrainResponse:
    return service.train_all()


@router.get("/models/metrics", response_model=list[ModelMetric])
def model_metrics(service: TrainingService = Depends(get_training_service)) -> list[ModelMetric]:
    return service.get_metrics()


@router.get("/models/best", response_model=ModelMetric)
def best_model(service: TrainingService = Depends(get_training_service)) -> ModelMetric:
    best = service.get_best_model()
    if best is None:
        raise HTTPException(status_code=404, detail="Модели еще не обучены")
    return best


@router.get("/models/feature-importance", response_model=list[FeatureImportanceSet])
def feature_importance(
    service: TrainingService = Depends(get_training_service),
) -> list[FeatureImportanceSet]:
    return service.get_feature_importance()


@router.post("/predict", response_model=PredictionResponse)
def predict(
    payload: PredictionRequest,
    service: PredictionService = Depends(get_prediction_service),
) -> PredictionResponse:
    return service.predict(payload)

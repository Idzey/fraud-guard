from functools import lru_cache

from app.services.dataset_service import DatasetService
from app.services.prediction_service import PredictionService
from app.services.training_service import TrainingService
from app.utils.paths import DATASET_PATH, ensure_runtime_directories


ensure_runtime_directories()


@lru_cache
def get_dataset_service() -> DatasetService:
    return DatasetService(DATASET_PATH)


@lru_cache
def get_training_service() -> TrainingService:
    return TrainingService(get_dataset_service())


@lru_cache
def get_prediction_service() -> PredictionService:
    return PredictionService(get_training_service())


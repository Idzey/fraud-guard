import joblib

from app.ml.preprocessing import transform_prediction_input
from app.schemas.ml import PredictionRequest, PredictionResponse
from app.services.training_service import TrainingService
from app.utils.paths import SCALER_PATH


class PredictionService:
    """Runs fraud probability inference with the best available trained model."""

    def __init__(self, training_service: TrainingService) -> None:
        self.training_service = training_service

    def predict(self, payload: PredictionRequest) -> PredictionResponse:
        self.training_service.ensure_trained()
        model_name = self.training_service.get_best_model_name()
        if model_name is None:
            raise RuntimeError("Нет доступной обученной модели")

        model = self.training_service.load_model(model_name)
        scaler = joblib.load(SCALER_PATH)
        frame = transform_prediction_input(payload.model_dump(), scaler)

        if model_name == "Isolation Forest":
            score = -model.decision_function(frame)[0]
            probability = min(max((float(score) + 0.25) / 1.5, 0.0), 1.0)
        elif hasattr(model, "predict_proba"):
            probability = float(model.predict_proba(frame)[0, 1])
        else:
            prediction_value = float(model.decision_function(frame)[0])
            probability = 1.0 / (1.0 + pow(2.718281828, -prediction_value))

        prediction = int(probability >= 0.5)
        return PredictionResponse(
            prediction=prediction,
            probability=round(probability, 6),
            risk=self._risk_label(probability),
        )

    def _risk_label(self, probability: float) -> str:
        if probability >= 0.7:
            return "High"
        if probability >= 0.35:
            return "Medium"
        return "Low"

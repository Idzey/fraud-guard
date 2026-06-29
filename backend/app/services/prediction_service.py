import joblib

from app.ml.preprocessing import FEATURE_COLUMNS, transform_prediction_input
from app.schemas.ml import (
    FeatureContribution,
    PredictionExplanation,
    PredictionRequest,
    PredictionResponse,
)
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
        payload_values = payload.model_dump()
        frame = transform_prediction_input(payload_values, scaler)

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
            explanation=self._build_explanation(
                model_name=model_name,
                probability=probability,
                payload_values=payload_values,
                transformed_values=frame.iloc[0].to_dict(),
            ),
        )

    def _build_explanation(
        self,
        model_name: str,
        probability: float,
        payload_values: dict[str, float],
        transformed_values: dict[str, float],
    ) -> PredictionExplanation:
        importance_map = self._feature_importance_map(model_name)
        raw_contributions: list[tuple[str, float, float]] = []

        for feature in FEATURE_COLUMNS:
            importance = importance_map.get(feature, 1.0 / len(FEATURE_COLUMNS))
            transformed_value = float(transformed_values.get(feature, 0.0))
            contribution = abs(transformed_value) * max(float(importance), 0.000001)
            raw_contributions.append((feature, importance, contribution))

        total = sum(item[2] for item in raw_contributions) or 1.0
        ranked = sorted(raw_contributions, key=lambda item: item[2], reverse=True)[:8]

        return PredictionExplanation(
            model=model_name,
            method="Feature importance модели + отклонение значения признака в этой транзакции",
            summary=self._summary(probability),
            top_factors=[
                FeatureContribution(
                    feature=feature,
                    value=round(float(payload_values.get(feature, 0.0)), 6),
                    importance=round(float(importance), 6),
                    contribution=round(float(contribution / total), 6),
                    reason=self._reason_for_feature(
                        feature=feature,
                        raw_value=float(payload_values.get(feature, 0.0)),
                        transformed_value=float(transformed_values.get(feature, 0.0)),
                    ),
                )
                for feature, importance, contribution in ranked
            ],
        )

    def _feature_importance_map(self, model_name: str) -> dict[str, float]:
        for importance_set in self.training_service.get_feature_importance():
            if importance_set.model == model_name:
                return {
                    item.feature: max(float(item.importance), 0.0)
                    for item in importance_set.features
                }
        return {}

    def _reason_for_feature(
        self,
        feature: str,
        raw_value: float,
        transformed_value: float,
    ) -> str:
        direction = "выше среднего" if transformed_value > 0 else "ниже среднего"
        distance = abs(transformed_value)

        if feature == "Amount":
            if distance >= 2:
                return f"Amount заметно {direction}; сумма операции нетипична для обучающей выборки."
            return f"Amount {direction}, но отклонение умеренное."

        if feature == "Time":
            if distance >= 2:
                return "Time заметно отличается от среднего времени транзакций в обучающей выборке."
            return "Time учитывается после масштабирования и дает умеренный вклад."

        if distance >= 2:
            return f"{feature} сильно отклоняется от типичного диапазона; для PCA-признаков это важный сигнал."
        if distance >= 1:
            return f"{feature} умеренно отклоняется от среднего значения."
        return f"{feature} имеет небольшой вклад, но модель считает этот признак важным."

    def _summary(self, probability: float) -> str:
        if probability >= 0.7:
            return (
                "Модель относит транзакцию к высокому риску из-за сочетания нетипичных значений "
                "в наиболее важных признаках."
            )
        if probability >= 0.35:
            return (
                "Модель видит несколько подозрительных сигналов, но уверенность недостаточна для "
                "однозначно высокого риска."
            )
        return "Модель не нашла сильного сочетания признаков, характерного для мошеннических транзакций."

    def _risk_label(self, probability: float) -> str:
        if probability >= 0.7:
            return "High"
        if probability >= 0.35:
            return "Medium"
        return "Low"

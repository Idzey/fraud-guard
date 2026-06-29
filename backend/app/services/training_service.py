import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
from catboost import CatBoostClassifier
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from xgboost import XGBClassifier

from app.ml.preprocessing import prepare_dataset
from app.schemas.ml import (
    ConfusionMatrix,
    CurvePoint,
    FeatureImportance,
    FeatureImportanceSet,
    ModelMetric,
    TrainResponse,
)
from app.services.dataset_service import DatasetService
from app.utils.paths import ARTIFACTS_PATH, MODELS_DIR


MODEL_FILENAMES = {
    "Random Forest": "random-forest.joblib",
    "XGBoost": "xgboost.joblib",
    "CatBoost": "catboost.joblib",
    "Isolation Forest": "isolation-forest.joblib",
}


class TrainingService:
    """Trains all fraud detection models and keeps their metrics available for the API."""

    def __init__(self, dataset_service: DatasetService, models_dir: Path = MODELS_DIR) -> None:
        self.dataset_service = dataset_service
        self.models_dir = models_dir
        self.models_dir.mkdir(parents=True, exist_ok=True)
        self._metrics: list[ModelMetric] = []
        self._feature_importance: list[FeatureImportanceSet] = []
        self._load_artifacts()

    def train_all(self) -> TrainResponse:
        self.dataset_service.reload()
        prepared = prepare_dataset(self.dataset_service.dataset_path)
        fraud_count = int(prepared.y_train.sum())
        normal_count = int(len(prepared.y_train) - fraud_count)
        scale_pos_weight = max(normal_count / max(fraud_count, 1), 1.0)
        contamination = min(max(float(prepared.y_train.mean()), 0.001), 0.2)

        models: dict[str, Any] = {
            "Random Forest": RandomForestClassifier(
                n_estimators=140,
                max_depth=None,
                min_samples_leaf=2,
                class_weight="balanced_subsample",
                random_state=42,
                n_jobs=-1,
            ),
            "XGBoost": XGBClassifier(
                n_estimators=180,
                max_depth=4,
                learning_rate=0.075,
                subsample=0.9,
                colsample_bytree=0.9,
                eval_metric="logloss",
                random_state=42,
                n_jobs=-1,
                scale_pos_weight=scale_pos_weight,
            ),
            "CatBoost": CatBoostClassifier(
                iterations=180,
                depth=5,
                learning_rate=0.075,
                loss_function="Logloss",
                auto_class_weights="Balanced",
                random_seed=42,
                verbose=False,
            ),
            "Isolation Forest": IsolationForest(
                n_estimators=220,
                contamination=contamination,
                random_state=42,
                n_jobs=-1,
            ),
        }

        metrics: list[ModelMetric] = []
        feature_importance: list[FeatureImportanceSet] = []

        for model_name, model in models.items():
            model.fit(prepared.x_train, prepared.y_train)
            probabilities = self._predict_probability(model_name, model, prepared.x_test)
            predictions = (probabilities >= 0.5).astype(int)

            model_metric = self._calculate_metrics(
                model_name=model_name,
                y_true=prepared.y_test.to_numpy(),
                probabilities=probabilities,
                predictions=predictions,
            )
            metrics.append(model_metric)

            model_importance = self._extract_feature_importance(
                model_name=model_name,
                model=model,
                feature_names=prepared.feature_names,
            )
            if model_importance.features:
                feature_importance.append(model_importance)

            joblib.dump(model, self.models_dir / MODEL_FILENAMES[model_name])

        self._metrics = sorted(metrics, key=lambda item: item.roc_auc, reverse=True)
        self._feature_importance = feature_importance
        self._save_artifacts()

        return TrainResponse(status="success", trained_models=list(models.keys()))

    def ensure_trained(self) -> None:
        if self._metrics and self.get_best_model_name():
            return
        self.train_all()

    def get_metrics(self) -> list[ModelMetric]:
        return self._metrics

    def get_best_model(self) -> ModelMetric | None:
        if not self._metrics:
            return None
        return max(self._metrics, key=lambda item: item.roc_auc)

    def get_best_model_name(self) -> str | None:
        best = self.get_best_model()
        return best.model if best else None

    def get_feature_importance(self) -> list[FeatureImportanceSet]:
        return self._feature_importance

    def load_model(self, model_name: str):
        model_path = self.models_dir / MODEL_FILENAMES[model_name]
        if not model_path.exists():
            self.train_all()
        return joblib.load(model_path)

    def _predict_probability(self, model_name: str, model: Any, features) -> np.ndarray:
        if model_name == "Isolation Forest":
            scores = -model.decision_function(features)
            minimum = float(scores.min())
            maximum = float(scores.max())
            if maximum == minimum:
                return np.zeros_like(scores, dtype=float)
            return (scores - minimum) / (maximum - minimum)

        if hasattr(model, "predict_proba"):
            return model.predict_proba(features)[:, 1]

        decision = model.decision_function(features)
        return 1.0 / (1.0 + np.exp(-decision))

    def _calculate_metrics(
        self,
        model_name: str,
        y_true: np.ndarray,
        probabilities: np.ndarray,
        predictions: np.ndarray,
    ) -> ModelMetric:
        roc_auc = self._safe_metric(lambda: roc_auc_score(y_true, probabilities))
        precision = self._safe_metric(lambda: precision_score(y_true, predictions, zero_division=0))
        recall = self._safe_metric(lambda: recall_score(y_true, predictions, zero_division=0))
        f1 = self._safe_metric(lambda: f1_score(y_true, predictions, zero_division=0))
        accuracy = self._safe_metric(lambda: accuracy_score(y_true, predictions))
        pr_auc = self._safe_metric(lambda: average_precision_score(y_true, probabilities))

        tn, fp, fn, tp = confusion_matrix(y_true, predictions, labels=[0, 1]).ravel()
        false_positive_rate, true_positive_rate, _ = roc_curve(y_true, probabilities)
        precision_curve, recall_curve, _ = precision_recall_curve(y_true, probabilities)

        return ModelMetric(
            model=model_name,
            roc_auc=round(roc_auc, 6),
            precision=round(precision, 6),
            recall=round(recall, 6),
            f1=round(f1, 6),
            accuracy=round(accuracy, 6),
            pr_auc=round(pr_auc, 6),
            confusion_matrix=ConfusionMatrix(
                true_negative=int(tn),
                false_positive=int(fp),
                false_negative=int(fn),
                true_positive=int(tp),
            ),
            roc_curve=self._downsample_curve(false_positive_rate, true_positive_rate),
            precision_recall_curve=self._downsample_curve(recall_curve, precision_curve),
        )

    def _extract_feature_importance(
        self,
        model_name: str,
        model: Any,
        feature_names: list[str],
    ) -> FeatureImportanceSet:
        if hasattr(model, "feature_importances_"):
            raw_values = np.asarray(model.feature_importances_, dtype=float)
        else:
            return FeatureImportanceSet(model=model_name, features=[])

        total = float(np.sum(np.abs(raw_values)))
        normalized = raw_values / total if total else raw_values
        ranked = sorted(
            zip(feature_names, normalized, strict=True),
            key=lambda item: abs(float(item[1])),
            reverse=True,
        )[:15]

        return FeatureImportanceSet(
            model=model_name,
            features=[
                FeatureImportance(feature=feature, importance=round(float(value), 6))
                for feature, value in ranked
            ],
        )

    def _downsample_curve(self, x_values: np.ndarray, y_values: np.ndarray) -> list[CurvePoint]:
        if len(x_values) <= 80:
            indexes = range(len(x_values))
        else:
            indexes = np.linspace(0, len(x_values) - 1, 80).astype(int)
        return [
            CurvePoint(x=round(float(x_values[index]), 6), y=round(float(y_values[index]), 6))
            for index in indexes
        ]

    def _save_artifacts(self) -> None:
        payload = {
            "metrics": [metric.model_dump() for metric in self._metrics],
            "feature_importance": [item.model_dump() for item in self._feature_importance],
        }
        ARTIFACTS_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    def _load_artifacts(self) -> None:
        if not ARTIFACTS_PATH.exists():
            return
        payload = json.loads(ARTIFACTS_PATH.read_text(encoding="utf-8"))
        self._metrics = [ModelMetric.model_validate(item) for item in payload.get("metrics", [])]
        self._feature_importance = [
            FeatureImportanceSet.model_validate(item)
            for item in payload.get("feature_importance", [])
        ]

    def _safe_metric(self, metric_function) -> float:
        try:
            value = float(metric_function())
        except ValueError:
            return 0.0
        return value if np.isfinite(value) else 0.0


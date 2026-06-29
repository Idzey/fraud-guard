from dataclasses import dataclass
from pathlib import Path

import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from app.utils.paths import SCALER_PATH


FEATURE_COLUMNS = ["Time", *[f"V{i}" for i in range(1, 29)], "Amount"]
TARGET_COLUMN = "Class"
SCALED_COLUMNS = ["Time", "Amount"]


@dataclass(slots=True)
class PreparedData:
    x_train: pd.DataFrame
    x_test: pd.DataFrame
    y_train: pd.Series
    y_test: pd.Series
    scaler: StandardScaler
    feature_names: list[str]
    dataframe: pd.DataFrame


def read_creditcard_csv(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(
            f"Файл датасета не найден: {path}. Скачайте Kaggle Credit Card Fraud Detection "
            "и сохраните его как backend/data/creditcard.csv."
        )

    dataframe = pd.read_csv(path)
    missing_columns = [column for column in [*FEATURE_COLUMNS, TARGET_COLUMN] if column not in dataframe]
    if missing_columns:
        joined = ", ".join(missing_columns)
        raise ValueError(f"В датасете отсутствуют обязательные колонки: {joined}")

    ordered = dataframe[[*FEATURE_COLUMNS, TARGET_COLUMN]].copy()
    ordered = ordered.apply(pd.to_numeric, errors="coerce")
    ordered[FEATURE_COLUMNS] = ordered[FEATURE_COLUMNS].fillna(ordered[FEATURE_COLUMNS].median())
    ordered[TARGET_COLUMN] = ordered[TARGET_COLUMN].fillna(0).astype(int)
    return ordered


def prepare_dataset(path: Path, test_size: float = 0.2, random_state: int = 42) -> PreparedData:
    dataframe = read_creditcard_csv(path)
    x = dataframe[FEATURE_COLUMNS].copy().astype(float)
    y = dataframe[TARGET_COLUMN].copy()

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=test_size,
        stratify=y,
        random_state=random_state,
    )

    scaler = StandardScaler()
    x_train.loc[:, SCALED_COLUMNS] = scaler.fit_transform(x_train[SCALED_COLUMNS])
    x_test.loc[:, SCALED_COLUMNS] = scaler.transform(x_test[SCALED_COLUMNS])

    SCALER_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(scaler, SCALER_PATH)

    return PreparedData(
        x_train=x_train,
        x_test=x_test,
        y_train=y_train,
        y_test=y_test,
        scaler=scaler,
        feature_names=FEATURE_COLUMNS,
        dataframe=dataframe,
    )


def transform_prediction_input(values: dict[str, float], scaler: StandardScaler) -> pd.DataFrame:
    row = {column: float(values.get(column, 0.0)) for column in FEATURE_COLUMNS}
    frame = pd.DataFrame([row], columns=FEATURE_COLUMNS)
    frame.loc[:, SCALED_COLUMNS] = scaler.transform(frame[SCALED_COLUMNS])
    return frame

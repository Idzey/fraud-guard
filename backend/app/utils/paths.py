from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BACKEND_DIR / "data"
MODELS_DIR = BACKEND_DIR / "models"
DATASET_PATH = DATA_DIR / "creditcard.csv"
ARTIFACTS_PATH = MODELS_DIR / "training-artifacts.json"
SCALER_PATH = MODELS_DIR / "standard-scaler.joblib"


def ensure_runtime_directories() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    MODELS_DIR.mkdir(parents=True, exist_ok=True)


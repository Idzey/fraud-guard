# FraudGuard ML

Fullstack-приложение для дипломного проекта **«Обнаружение мошеннических банковских транзакций с использованием методов машинного обучения»**.

В проекте нет мокнутого API и нет синтетического датасета. Backend обучает реальные модели на файле `backend/data/creditcard.csv`, который должен быть взят из Kaggle Credit Card Fraud Detection. Frontend получает данные только из FastAPI backend через Axios.

## Структура

```text
.
├── backend
│   ├── app
│   │   ├── api
│   │   ├── core
│   │   ├── ml
│   │   ├── schemas
│   │   ├── services
│   │   ├── utils
│   │   └── main.py
│   ├── data
│   │   └── creditcard.csv
│   ├── models
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── hooks
│   │   ├── pages
│   │   ├── types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## Датасет

Скачайте Kaggle Credit Card Fraud Detection dataset и положите CSV сюда:

```text
backend/data/creditcard.csv
```

Файл должен содержать колонки:

```text
Time, V1, V2, ..., V28, Amount, Class
```

Где `Class = 0` означает обычную транзакцию, а `Class = 1` означает мошенническую транзакцию.

Если файла нет, backend не будет подставлять демо-данные и вернет ошибку. Это сделано специально, чтобы в дипломном проекте не было моков.

## Запуск backend

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

API будет доступен на:

```text
http://localhost:8000
```

## Запуск frontend

```bash
cd frontend
npm install
npm run dev
```

Интерфейс будет доступен на:

```text
http://localhost:5173
```

## Docker

```bash
docker compose up --build
```

Frontend:

```text
http://localhost:8080
```

Backend:

```text
http://localhost:8000
```

## Предобработка

Модуль `backend/app/ml/preprocessing.py` выполняет:

- чтение CSV;
- проверку обязательных колонок;
- обработку пропусков медианами;
- масштабирование `Time` и `Amount` через `StandardScaler`;
- `train_test_split` со `stratify`;
- `random_state=42`.

## Модели

Обучаются четыре модели:

- **Random Forest**
- **XGBoost**
- **CatBoost**
- **Isolation Forest**

Для каждой модели считаются:

- ROC-AUC
- Precision
- Recall
- F1-score
- Accuracy
- PR-AUC
- Confusion Matrix
- ROC Curve
- Precision-Recall Curve

Feature Importance рассчитывается для моделей, которые его поддерживают.

## API

| Метод | Endpoint | Назначение |
|---|---|---|
| GET | `/health` | Проверка доступности API |
| GET | `/dataset/info` | Информация о датасете |
| GET | `/dataset/preview` | Первые 20 строк датасета |
| POST | `/models/train` | Обучение всех моделей |
| GET | `/models/metrics` | Метрики моделей |
| GET | `/models/best` | Лучшая модель по ROC-AUC |
| GET | `/models/feature-importance` | TOP-15 важных признаков |
| POST | `/predict` | Предсказание риска для одной транзакции |

Пример `/predict`:

```json
{
  "Time": 0,
  "Amount": 120,
  "V1": 0,
  "V2": 0,
  "V3": 0,
  "V4": 0,
  "V5": 0,
  "V6": 0,
  "V7": 0,
  "V8": 0,
  "V9": 0,
  "V10": 0,
  "V11": 0,
  "V12": 0,
  "V13": 0,
  "V14": 0,
  "V15": 0,
  "V16": 0,
  "V17": 0,
  "V18": 0,
  "V19": 0,
  "V20": 0,
  "V21": 0,
  "V22": 0,
  "V23": 0,
  "V24": 0,
  "V25": 0,
  "V26": 0,
  "V27": 0,
  "V28": 0
}
```

Ответ:

```json
{
  "prediction": 1,
  "probability": 0.94,
  "risk": "High"
}
```

## Frontend

Страницы:

- **Обзор**: сводные карточки, распределение классов, качество моделей.
- **Датасет**: статистика и таблица первых 20 строк.
- **Модели**: сортируемая таблица метрик, Feature Importance, ROC Curve, Precision-Recall Curve, Confusion Matrix.
- **Предсказание**: форма для `Time`, `Amount`, `V1`-`V28`, badge риска и Progress вероятности.

Используются React 19, TypeScript, Vite, TailwindCSS, shadcn-style компоненты, React Router, Axios, Recharts и Lucide React.

## UML-диаграммы

Диаграммы написаны в формате Mermaid, поэтому они отображаются прямо в GitHub README.

### Use Case

```mermaid
flowchart LR
    user([Пользователь])
    student([Студент / исследователь])
    admin([Администратор системы])

    subgraph system[FraudGuard ML]
        ucDashboard([Просмотреть обзор])
        ucDataset([Изучить датасет])
        ucTrain([Обучить модели])
        ucMetrics([Сравнить метрики])
        ucBest([Определить лучшую модель])
        ucPredict([Проверить транзакцию])
        ucExplain([Получить объяснение риска])
    end

    user --> ucDashboard
    user --> ucDataset
    user --> ucMetrics
    user --> ucPredict
    ucPredict --> ucExplain

    student --> ucDataset
    student --> ucMetrics
    student --> ucBest

    admin --> ucTrain
    admin --> ucBest
```

### Activity Diagram

```mermaid
flowchart TD
    start((Старт))
    open[Пользователь открывает frontend]
    load[Frontend запрашивает данные API]
    trained{Модели уже обучены?}
    read[Backend читает creditcard.csv]
    preprocess[Предобработка: проверка колонок, пропуски, scaling Time и Amount]
    train[Обучение Random Forest, XGBoost, CatBoost, Isolation Forest]
    save[Сохранение моделей и метрик]
    show[Показ метрик, графиков и лучшей модели]
    input[Пользователь вводит параметры транзакции]
    transform[Backend масштабирует входные Time и Amount]
    predict[Лучшая модель считает вероятность fraud]
    risk{Вероятность риска}
    low[Low risk]
    medium[Medium risk]
    high[High risk]
    finish((Конец))

    start --> open --> load --> trained
    trained -- Нет --> read --> preprocess --> train --> save --> show
    trained -- Да --> show
    show --> input --> transform --> predict --> risk
    risk -- "до 0.35" --> low --> finish
    risk -- "0.35 - 0.70" --> medium --> finish
    risk -- "от 0.70" --> high --> finish
```

### Sequence Diagram

```mermaid
sequenceDiagram
    actor User as Пользователь
    participant UI as React Frontend
    participant API as FastAPI Backend
    participant Training as TrainingService
    participant Data as DatasetService
    participant Model as Лучшая ML-модель

    User->>UI: Открывает приложение
    UI->>API: GET /dataset/info
    API->>Data: get_info()
    Data-->>API: Статистика датасета
    API-->>UI: DatasetInfo

    UI->>API: GET /models/metrics
    API->>Training: get_metrics()
    Training-->>API: Метрики моделей
    API-->>UI: Random Forest, XGBoost, CatBoost, Isolation Forest

    UI->>API: GET /models/best
    API->>Training: get_best_model()
    Training-->>API: XGBoost по ROC-AUC
    API-->>UI: Лучшая модель

    User->>UI: Вводит Time, Amount, V1...V28
    UI->>API: POST /predict
    API->>Training: ensure_trained()
    API->>Model: predict_proba()
    Model-->>API: Вероятность fraud
    API-->>UI: prediction, probability, risk, explanation
    UI-->>User: Результат проверки
```

### Component Diagram

```mermaid
flowchart LR
    subgraph browser[Browser]
        user[Пользователь]
    end

    subgraph frontend[Frontend: React + Vite]
        pages[Pages: Dashboard, Dataset, Models, Predict]
        hooks[Hooks: useDashboardData, useDataset, useModels, usePrediction]
        client[Axios API client]
        charts[Recharts UI]
    end

    subgraph backend[Backend: FastAPI]
        routes[API routes]
        dataset[DatasetService]
        training[TrainingService]
        prediction[PredictionService]
        preprocessing[Preprocessing]
    end

    subgraph storage[Files]
        csv[(creditcard.csv)]
        artifacts[(training-artifacts.json)]
        models[(joblib models)]
        scaler[(standard-scaler.joblib)]
    end

    user --> pages
    pages --> hooks
    hooks --> client
    client --> routes
    routes --> dataset
    routes --> training
    routes --> prediction
    dataset --> csv
    training --> preprocessing
    preprocessing --> csv
    training --> models
    training --> artifacts
    training --> scaler
    prediction --> models
    prediction --> scaler
    pages --> charts
```

### Deployment Diagram

```mermaid
flowchart TB
    user[Пользовательский браузер]

    subgraph vercel[Vercel]
        static[Static frontend build]
        envFront[VITE_API_URL]
    end

    subgraph backendHost[Backend hosting]
        fastapi[FastAPI + Uvicorn]
        envBack[FRAUD_CORS_ORIGINS]
        data[creditcard.csv]
        savedModels[models/*.joblib]
    end

    user -->|HTTPS| static
    static -->|Axios запросы к VITE_API_URL| fastapi
    fastapi --> envBack
    fastapi --> data
    fastapi --> savedModels

    note1[Backend может быть Render или локальный Uvicorn через ngrok]
    note1 -.-> backendHost
```

### Class Diagram

```mermaid
classDiagram
    class DatasetService {
        +dataset_path
        +reload()
        +get_info()
        +get_preview()
        +get_samples()
    }

    class TrainingService {
        +train_all()
        +ensure_trained()
        +get_metrics()
        +get_best_model()
        +get_feature_importance()
        +load_model(model_name)
    }

    class PredictionService {
        +predict(payload)
        -_risk_label(probability)
        -_build_explanation(model_name, probability, payload_values, transformed_values)
    }

    class Preprocessing {
        +read_creditcard_csv(path)
        +prepare_dataset(path)
        +transform_prediction_input(values, scaler)
    }

    class ModelMetric {
        +model
        +roc_auc
        +precision
        +recall
        +f1
        +accuracy
        +pr_auc
        +confusion_matrix
    }

    class PredictionRequest {
        +Time
        +Amount
        +V1_to_V28
    }

    class PredictionResponse {
        +prediction
        +probability
        +risk
        +explanation
    }

    DatasetService --> Preprocessing : предоставляет CSV
    TrainingService --> DatasetService : reload/info
    TrainingService --> Preprocessing : готовит train/test
    TrainingService --> ModelMetric : формирует метрики
    PredictionService --> TrainingService : берет лучшую модель
    PredictionService --> PredictionRequest : принимает признаки
    PredictionService --> PredictionResponse : возвращает результат
```

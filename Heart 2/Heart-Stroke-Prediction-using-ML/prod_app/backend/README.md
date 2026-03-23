FastAPI backend for Heart Stroke Prediction

Quick start

1. Create a virtual environment and install requirements:

```bash
python -m venv .venv
.\.venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

2. Train a model (this uses `heart.csv` at repo root):

```bash
python train_model.py
```

3. Run the API:

```bash
uvicorn main:app --reload --port 8000
```

Endpoints

- `GET /health` — health and model status
- `POST /predict` — JSON: {"features": {"age": 60, ...}}
- `POST /retrain` — retrain model from dataset

Notes

- SHAP integration is attempted; if SHAP is not available a feature importance fallback is returned.
- Ensure `heart.csv` exists in the repository root (the training script expects it).

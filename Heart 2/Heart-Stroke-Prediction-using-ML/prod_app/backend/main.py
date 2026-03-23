from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os
import numpy as np
import pandas as pd

app = FastAPI(title="Heart Stroke Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Candidate model paths (primary: backend models folder; fallbacks: repo root)
MODEL_CANDIDATES = [
    os.path.join(os.path.dirname(__file__), "models", "model.pkl"),
    os.path.join(os.path.dirname(__file__), "..", "..", "model.sav"),
    os.path.join(os.path.dirname(__file__), "..", "..", "model.pkl"),
]

model = None
feature_order = None

class PredictRequest(BaseModel):
    features: dict

class PredictResponse(BaseModel):
    risk_score: float
    risk_category: str
    confidence: float
    prediction: int
    explain: dict = None


def load_model():
    """Try to load a model from a list of candidate locations.
    This allows using a top-level `model.sav` or `model.pkl` without copying.
    """
    global model, feature_order
    model = None
    feature_order = None
    for path in MODEL_CANDIDATES:
        try:
            if os.path.exists(path):
                model = joblib.load(path)
                if hasattr(model, 'feature_names_in_'):
                    feature_order = list(model.feature_names_in_)
                else:
                    feature_order = None
                return
        except Exception:
            # try next candidate
            model = None
            feature_order = None


load_model()

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not available. Run training first.")
    # Build numpy array in expected feature order
    data = req.features
    if feature_order:
        try:
            x = np.array([data[k] for k in feature_order], dtype=float).reshape(1, -1)
        except Exception:
            # fallback to sorting keys
            x = np.array([data[k] for k in sorted(data.keys())], dtype=float).reshape(1, -1)
    else:
        x = np.array([data[k] for k in sorted(data.keys())], dtype=float).reshape(1, -1)

    proba = model.predict_proba(x)[0, 1] if hasattr(model, 'predict_proba') else float(model.predict(x)[0])
    pred = int(proba >= 0.5)
    score = float(proba * 100)
    if score >= 70:
        category = 'High'
    elif score >= 35:
        category = 'Medium'
    else:
        category = 'Low'

    explain = None
    try:
        import shap
        explainer = shap.Explainer(model, masker=shap.maskers.Independent(np.zeros(x.shape[1])))
        shap_values = explainer(x)
        # create simple mapping
        if hasattr(shap_values, 'values'):
            vals = shap_values.values[0].tolist()
        else:
            vals = list(shap_values[0])
        if feature_order:
            keys = feature_order
        else:
            keys = sorted(req.features.keys())
        explain = {k: float(v) for k, v in zip(keys, vals)}
    except Exception:
        # fallback to feature_importances_ if available
        if hasattr(model, 'feature_importances_'):
            if feature_order:
                keys = feature_order
            else:
                keys = sorted(req.features.keys())
            fi = model.feature_importances_.tolist()
            explain = {k: float(v) for k, v in zip(keys, fi)}

    return PredictResponse(
        risk_score=score,
        risk_category=category,
        confidence=float(proba),
        prediction=pred,
        explain=explain,
    )

@app.post('/retrain')
def retrain():
    # Simple retrain endpoint: runs the training script and reloads the model
    try:
        import subprocess
        script = os.path.join(os.path.dirname(__file__), 'train_model.py')
        subprocess.check_call(['python', script])
        load_model()
        return {"status": "trained", "model_loaded": model is not None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

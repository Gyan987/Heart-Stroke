"""Train a RandomForest model on the existing `heart.csv` dataset and save it.
Run: python train_model.py
"""
import os
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score
import joblib

ROOT = os.path.dirname(__file__)
DATA_PATH = os.path.join(ROOT, "..", "..", "heart.csv")
MODEL_PATH = os.path.join(ROOT, "models", "model.pkl")

def load_data(path=DATA_PATH):
    df = pd.read_csv(path)
    # Expect the target column to be named 'target' or 'stroke' or similar - adapt as needed
    if 'target' in df.columns:
        y = df['target']
        X = df.drop(columns=['target'])
    elif 'stroke' in df.columns:
        y = df['stroke']
        X = df.drop(columns=['stroke'])
    else:
        # assume last column is target
        y = df.iloc[:, -1]
        X = df.iloc[:, :-1]
    return X, y


def train():
    X, y = load_data()
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
    clf = RandomForestClassifier(n_estimators=200, random_state=42)
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_val)
    y_proba = clf.predict_proba(X_val)[:, 1]
    acc = accuracy_score(y_val, y_pred)
    auc = roc_auc_score(y_val, y_proba)
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(clf, MODEL_PATH)
    print(f"Saved model to {MODEL_PATH}")
    print(f"Validation accuracy: {acc:.3f}, ROC AUC: {auc:.3f}")

if __name__ == '__main__':
    train()

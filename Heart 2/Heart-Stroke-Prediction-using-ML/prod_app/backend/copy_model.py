"""Helper to copy root model.sav or model.pkl into prod_app/backend/models/model.pkl
Run from repo root or backend folder: python copy_model.py
This is a safe, non-destructive helper that will not overwrite if destination exists.
"""
import os
import shutil

ROOT = os.path.dirname(__file__)
SRC_CANDIDATES = [
    os.path.join(ROOT, "..", "..", "model.sav"),
    os.path.join(ROOT, "..", "..", "model.pkl"),
]
DST_DIR = os.path.join(ROOT, "models")
DST_PATH = os.path.join(DST_DIR, "model.pkl")

if __name__ == '__main__':
    if os.path.exists(DST_PATH):
        print(f"Destination already exists: {DST_PATH}")
        exit(0)

    for s in SRC_CANDIDATES:
        if os.path.exists(s):
            os.makedirs(DST_DIR, exist_ok=True)
            shutil.copy2(s, DST_PATH)
            print(f"Copied {s} -> {DST_PATH}")
            exit(0)

    print("No source model found at repo root (model.sav or model.pkl). Place your model at the repo root or in backend/models/")
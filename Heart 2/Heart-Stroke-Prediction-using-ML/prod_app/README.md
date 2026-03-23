Full-stack Heart Stroke Prediction — scaffold

This folder contains a scaffold for a production-style app with:

- Backend: FastAPI (prod_app/backend)
- Frontend: React + Vite + Tailwind (prod_app/frontend)
- ML training script that consumes `heart.csv` at repo root

Quick setup

Backend

```bash
cd prod_app/backend
python -m venv .venv
. .venv/Scripts/activate    # Windows
pip install -r requirements.txt
python train_model.py       # trains and saves models/model.pkl
uvicorn main:app --reload --port 8000
```

Frontend

```bash
cd prod_app/frontend
npm install
npm run dev
```

PDF export

- The frontend includes a `DigitalHealthCard` component which can export the card as a PDF. Install additional frontend deps if needed:

```bash
cd prod_app/frontend
npm install jspdf html2canvas
```

Google Maps / SOS

- To enable embedded Google Maps for the SOS feature, create a `.env` file in `prod_app/frontend` with your Vite variable:

```
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

- The `SOS` button will attempt to get the user's location and either open Google Maps search for nearby hospitals or embed a map if the API key is provided.

Notes & next steps

- The frontend is a minimal yet modern dashboard scaffold. Replace placeholders, add styles, and wire additional components (chatbot, Google Maps) as needed.
- SHAP is used in the backend if available — on some platforms installing shap can require build tools.
- For production use, containerize the backend and serve the frontend as static assets.

Quick model shortcut

- If you already have a `model.sav` or `model.pkl` at the repository root, the backend will try to load it automatically. Alternatively run the helper to copy it into the backend models folder:

```bash
cd prod_app/backend
python copy_model.py
```

This avoids manual file moves when testing locally.

const form = document.getElementById("riskForm");
const resultTitle = document.getElementById("resultTitle");
const resultBody = document.getElementById("resultBody");
const resultMeta = document.getElementById("resultMeta");
const meterFill = document.getElementById("meterFill");
const prefillBtn = document.getElementById("prefillBtn");
const resultCard = document.getElementById("resultCard");
const toast = document.getElementById("toast");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");
const BACKEND_URL = "http://localhost:8000/predict";

const weights = {
  age: [55, 65],
  trestbps: 140,
  chol: 240,
  thalach: 120,
  oldpeak: 2,
  ca: 1,
};

const demoCopy = {
  low: {
    title: "Low demo risk",
    body: "Inputs indicate a lower demo score. Connect the model for a real prediction.",
  },
  medium: {
    title: "Moderate demo risk",
    body: "Several inputs are elevated. Review with the clinical team for follow-up.",
  },
  high: {
    title: "High demo risk",
    body: "Multiple indicators are elevated. Prioritize a full clinical assessment.",
  },
};

const fieldLabels = {
  age: "Age",
  sex: "Sex",
  cp: "Chest pain type",
  trestbps: "Resting blood pressure",
  chol: "Serum cholestoral",
  fbs: "Fasting blood sugar",
  restecg: "Resting ECG",
  thalach: "Max heart rate",
  exang: "Exercise induced angina",
  oldpeak: "Oldpeak",
  slope: "ST slope",
  ca: "Major vessels",
  thal: "Thalassemia",
};

const sampleValues = {
  age: 57,
  patient_name: 'John Doe',
  sex: 1,
  cp: 3,
  trestbps: 145,
  chol: 233,
  fbs: 1,
  restecg: 1,
  thalach: 130,
  exang: 0,
  oldpeak: 1.4,
  slope: 1,
  ca: 0,
  thal: 2,
};

const scrollButtons = document.querySelectorAll("[data-scroll]");
scrollButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(button.dataset.scroll);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// 3D tilt effect for cards
function applyTilt(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.classList.add('tilt');
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rx = -y * 8; // rotateX
    const ry = x * 12; // rotateY
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
}

applyTilt('.hero-card');
applyTilt('#resultCard');

// Stats counter when visible
function animateCounters() {
  const counters = document.querySelectorAll('.stat-value');
  counters.forEach((el) => {
    const target = Number(el.dataset.target || 0);
    let started = false;
    function run() {
      if (started) return; started = true;
      let cur = 0; const step = Math.max(1, Math.floor(target / 60));
      const id = setInterval(() => {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(id); }
        el.textContent = cur + (el.dataset.suffix || '%');
      }, 16);
    }
    // intersection observer
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(en => { if (en.isIntersecting) { run(); o.disconnect(); } });
    }, { threshold: 0.4 });
    obs.observe(el);
  });
}

document.addEventListener('DOMContentLoaded', animateCounters);

prefillBtn.addEventListener("click", () => {
  Object.entries(sampleValues).forEach(([name, value]) => {
    const field = form.elements[name];
    if (field) {
      field.value = value;
    }
  });
  form.dispatchEvent(new Event("submit", { cancelable: true }));
});

function setError(field, message) {
  field.classList.add("error");
  clearErrorMessage(field);
  const helper = document.createElement("span");
  helper.className = "error-message";
  helper.textContent = message;
  field.parentElement.appendChild(helper);
}

function clearErrorMessage(field) {
  const existing = field.parentElement.querySelector(".error-message");
  if (existing) {
    existing.remove();
  }
  field.classList.remove("error");
}

function validateField(field) {
  if (!field) {
    return true;
  }

  const { name, value } = field;
  if (!value) {
    setError(field, `${fieldLabels[name]} is required.`);
    return false;
  }

  const numeric = Number(value);
  if (field.type === "number" && Number.isNaN(numeric)) {
    setError(field, `${fieldLabels[name]} must be numeric.`);
    return false;
  }

  if (field.min && numeric < Number(field.min)) {
    setError(field, `${fieldLabels[name]} must be at least ${field.min}.`);
    return false;
  }

  if (field.max && numeric > Number(field.max)) {
    setError(field, `${fieldLabels[name]} must be at most ${field.max}.`);
    return false;
  }

  clearErrorMessage(field);
  return true;
}

function calculateScore(values) {
  let score = 0;
  if (values.age >= weights.age[1]) score += 3;
  else if (values.age >= weights.age[0]) score += 2;

  if (values.sex === 1) score += 1;
  if (values.cp === 3) score += 2;
  if (values.trestbps >= weights.trestbps) score += 2;
  if (values.chol >= weights.chol) score += 2;
  if (values.fbs === 1) score += 1;
  if (values.restecg === 2) score += 1;
  if (values.thalach < weights.thalach) score += 2;
  if (values.exang === 1) score += 2;
  if (values.oldpeak >= weights.oldpeak) score += 2;
  if (values.slope === 2) score += 1;
  if (values.ca >= weights.ca) score += 2;
  if (values.thal >= 1) score += 2;

  return score;
}

function scoreToLevel(score) {
  if (score >= 9) return "high";
  if (score >= 5) return "medium";
  return "low";
}

function showToast(level, message) {
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${level}`;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.className = "toast";
  }, 3200);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = Array.from(form.elements).filter(
    (el) => el.tagName === "INPUT" || el.tagName === "SELECT"
  );

  const isValid = fields.every((field) => validateField(field));
  if (!isValid) {
    resultTitle.textContent = "Check required fields";
    resultBody.textContent = "Fill in the highlighted fields to continue.";
    return;
  }

  const values = fields.reduce((acc, field) => {
    if (field.type === 'number' || field.tagName === 'SELECT') {
      acc[field.name] = Number(field.value);
    } else {
      acc[field.name] = field.value;
    }
    return acc;
  }, {});

  // features payload excludes non-feature fields like patient_name
  const featuresPayload = Object.fromEntries(
    Object.entries(values).filter(([k]) => k !== 'patient_name')
  );

  // Try backend prediction first, fall back to local demo scoring
  fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ features: featuresPayload }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("no backend");
      return res.json();
    })
    .then((data) => {
      // backend returns risk_score (0-100), risk_category, confidence
      const scorePct = Math.round(data.risk_score);
      const category = (data.risk_category || "Low").toLowerCase();
      const score12 = Math.round((scorePct / 100) * 12);
      const meterPercent = Math.min(100, Math.round((score12 / 12) * 100));

      resultTitle.textContent = `${data.risk_category} risk`;
      resultBody.textContent = `Confidence: ${(data.confidence * 100).toFixed(1)}%`;
      resultMeta.textContent = `Score: ${scorePct} / 100`;
      meterFill.style.width = `${meterPercent}%`;
      resultCard.className = `result-card ${category}`;

      // store for PDF and UI
      window.lastResult = { patient_name: values.patient_name || '', values, score: scorePct, level: category, backend: true, raw: data };
      // update dashboard
      const percentEl = document.getElementById('resultPercent');
      if (percentEl) percentEl.textContent = scorePct + '%';
      const dashSum = document.getElementById('dashboardSummary');
      if (dashSum) dashSum.textContent = `${values.patient_name || 'Patient'} — Risk: ${data.risk_category} (${(data.confidence*100).toFixed(1)}% confidence)`;
      const explainList = document.getElementById('dashboardExplain');
      if (explainList) {
        explainList.innerHTML = '';
        if (data.explain) {
          Object.entries(data.explain).slice(0,8).forEach(([k,v]) => {
            const li = document.createElement('li');
            li.textContent = `${k}: ${Number(v).toFixed(3)}`;
            explainList.appendChild(li);
          });
        }
      }
    })
    .catch(() => {
      // fallback to local demo calculation
      const score12 = calculateScore(values);
      const level = scoreToLevel(score12);
      const meterPercent = Math.min(100, Math.round((score12 / 12) * 100));

      resultTitle.textContent = demoCopy[level].title;
      resultBody.textContent = demoCopy[level].body;
      resultMeta.textContent = `Score: ${score12} / 12`;
      meterFill.style.width = `${meterPercent}%`;
      resultCard.className = `result-card ${level}`;

      window.lastResult = { patient_name: values.patient_name || '', values, score: Math.round((score12/12)*100), level, backend: false };

      // update dashboard for local demo
      const percentEl2 = document.getElementById('resultPercent');
      if (percentEl2) percentEl2.textContent = Math.round((score12/12)*100) + '%';
      const dashSum2 = document.getElementById('dashboardSummary');
      if (dashSum2) dashSum2.textContent = `${values.patient_name || 'Patient'} — Demo risk: ${demoCopy[level].title}`;
      const explainList2 = document.getElementById('dashboardExplain');
      if (explainList2) {
        explainList2.innerHTML = '';
        // show top few fields used in demo score
        ['age','trestbps','chol','thalach','oldpeak','ca'].forEach(k => {
          if (k in values) {
            const li = document.createElement('li');
            li.textContent = `${k}: ${values[k]}`;
            explainList2.appendChild(li);
          }
        });
      }

      if (level === "low") {
        showToast("safe", "Safe range: demo score is low.");
      }

      if (level === "high") {
        showToast("risk", "Risk alert: demo score is high.");
      }
    });
});

form.addEventListener("reset", () => {
  const fields = Array.from(form.elements).filter(
    (el) => el.tagName === "INPUT" || el.tagName === "SELECT"
  );
  fields.forEach((field) => clearErrorMessage(field));
  resultTitle.textContent = "Awaiting input";
  resultBody.textContent = "Complete the form to get a demo estimate.";
  resultMeta.textContent = "Score: 0 / 12";
  meterFill.style.width = "0%";
  resultCard.className = "result-card";
});

function generatePDF(payload) {
  try {
    const { values, score, level } = payload;
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
      showToast('risk', 'PDF library not loaded');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Heart Stroke Prediction — Report', 14, 18);
    if (payload.patient_name) {
      doc.setFontSize(12);
      doc.text(`Patient: ${payload.patient_name}`, 14, 26);
    }

    const rows = Object.keys(values).map((k) => [fieldLabels[k] || k, String(values[k])]);

    // add score and level as top rows
    rows.unshift(['Risk level', String(level).toUpperCase()]);
    rows.unshift(['Score', `${score} / 12`]);

    doc.autoTable({
      startY: 28,
      head: [['Field', 'Value']],
      body: rows,
      styles: { cellPadding: 2, fontSize: 10 },
    });

    const timestamp = new Date().toISOString();
    const afterTableY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : doc.internal.pageSize.getHeight() - 30;
    doc.setFontSize(9);
    doc.text(`Generated: ${timestamp}`, 14, afterTableY);
    doc.text('Disclaimer: This is a demo report. Not clinically validated.', 14, afterTableY + 6);

    const filename = `heart-stroke-report-${timestamp.replace(/[:.]/g, '-')}.pdf`;
    doc.save(filename);
    showToast('safe', 'PDF downloaded');
  } catch (err) {
    console.error(err);
    showToast('risk', 'Could not generate PDF');
  }
}

if (downloadPdfBtn) {
  downloadPdfBtn.addEventListener('click', () => {
    if (window.lastResult) {
      generatePDF(window.lastResult);
    } else {
      showToast('risk', 'Generate an estimate first');
    }
  });
}

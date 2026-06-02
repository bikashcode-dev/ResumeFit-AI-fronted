<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f2027,50:1a73e8,100:00d9ff&height=180&section=header&text=ResumeFit%20AI&fontSize=46&fontColor=ffffff&fontAlignY=55&desc=ATS%20Resume%20Builder%20%26%20Analyzer&descAlignY=75&descSize=18&animation=fadeIn"/>

<br/>

[![Live App](https://img.shields.io/badge/Live_App-Open-00D9FF?style=for-the-badge&logo=netlify&logoColor=black)](https://ai-resume-builder-cv-match.netlify.app)
&nbsp;
[![Backend API](https://img.shields.io/badge/Backend_API-Render-6DB33F?style=for-the-badge&logo=render&logoColor=white)](https://resumefit-ai-backend.onrender.com)

<br/>

![Java](https://img.shields.io/badge/Java_17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.3.5-6DB33F?style=flat-square&logo=spring-boot&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=flat-square&logo=vite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)

</div>

---

## How it works

```
Upload Resume (PDF/DOCX)  →  Paste Job Description  →  ATS Score + Gaps  →  Edit & Export
```

---

## Features

| | Feature | What it does |
|---|---|---|
| 🎯 | ATS scoring | Match score with matched/missing keywords against any job description |
| ✨ | AI rewrite | Before/after resume optimization with section-level suggestions |
| 🏗️ | Resume builder | Build from scratch with drag-to-reorder skills, experience, and projects |
| 📤 | Multi-format export | DOCX · ATS PDF · minimal PDF · plain text — no account needed |

---

## Project structure

```
resume-builder/
  backend resume builder/        Spring Boot API
  frontend resume builder/
    resumefit-ai/                React + Vite frontend
```

---

## Frontend setup

**Stack:** React 18 · Vite 5 · React Router · Axios · Lucide React

```bash
cd "frontend resume builder/resumefit-ai"
npm install
npm run dev
```

Override API URL:
```env
VITE_API_URL=https://resumefit-ai-backend.onrender.com
```

**Netlify:** build command `npm run build` · publish dir `dist` · SPA routing via `public/_redirects`

---

## Backend setup

**Stack:** Java 17 · Spring Boot 3.3.5 · Maven · Apache PDFBox · Apache POI · Lombok

```bash
# Linux / Mac
cd "backend resume builder"
./mvnw spring-boot:run

# Windows
cd "backend resume builder"
.\mvnw.cmd spring-boot:run

# Build JAR
./mvnw clean package
```

> If Maven clean fails, a Java process is locking `target/` — stop it and retry.

---

## Environment variables

> Set in your deployment provider (Render dashboard) — never hardcode in source.  
> At minimum, set `APP_CORS_ALLOWED_ORIGINS` and one AI provider key.

| Variable | Default | |
|---|---|---|
| `APP_CORS_ALLOWED_ORIGINS` | — | ⚠️ Required |
| `GEMINI_API_KEY` | — | ⚠️ Min one AI key |
| `GEMINI_MODEL` | `gemini-2.5-flash` | |
| `OPENROUTER_API_KEY` | — | |
| `OPENROUTER_MODEL` | `openai/gpt-4o-mini` | |
| `LOCAL_AI_ENABLED` | `false` | Set `true` for local Ollama |
| `LOCAL_AI_URL` | `http://localhost:11434` | |
| `SERVER_PORT` | `8080` | |

---

## API reference

Base path: `/api`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/resume/parse` | Upload and parse PDF or DOCX |
| `POST` | `/api/job-descriptions/analyze` | Extract keywords from job description |
| `POST` | `/api/resume/match` | ATS match score |
| `POST` | `/api/resume/suggestions` | Section-level improvement suggestions |
| `POST` | `/api/resume/optimize` | AI-optimized resume draft |
| `POST` | `/api/resume/versions` | Generate multiple resume variants |
| `POST` | `/api/resume/builder/generate` | Build from structured profile data |
| `POST` | `/api/resume/builder/assist-section` | AI help for a single section |
| `POST` | `/api/resume/export/docx` | Export as DOCX |
| `POST` | `/api/resume/export/pdf/{style}` | Export as PDF — `ats`, `minimal`, or `template` |

**Key fields:**

`/api/resume/match` & `/api/resume/optimize` → `resumeText` · `jobDescription` · `skills` · `candidateStage` · `roleType`

`/api/resume/builder/generate` → `fullName` · `skills` · `roleType` · `candidateLevel`

---

## Docker (Render)

Dockerfile included — builds with Maven, runs Java 17, uses `prod` Spring profile, reads `PORT` env var.

Minimum on Render: `APP_CORS_ALLOWED_ORIGINS` + `GEMINI_API_KEY` or `OPENROUTER_API_KEY`

---

## Troubleshooting

> **Backend not reachable** — Render free tier sleeps after inactivity. Wait 30–60s on first request. Check CORS and deploy logs.

> **"Only PDF and DOCX supported"** — TXT and image files not accepted. Scanned PDFs with no text layer also fail.

> **Validation errors** — Resume and job description must each be 80–12000 characters. Paste full content, not a summary.

> **CORS errors** — When frontend domain changes, update `APP_CORS_ALLOWED_ORIGINS` and redeploy the backend.

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:00d9ff,100:0f2027&height=100&section=footer&animation=fadeIn"/>

</div>

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
01 Upload Resume (PDF/DOCX)
       ↓
02 Paste Job Description
       ↓
03 Get ATS Score + Keyword Gaps
       ↓
04 AI Optimize Resume
       ↓
05 Export (DOCX · ATS PDF · Minimal PDF · Plain Text)
```

---

## Features

| | Feature | Description |
|---|---|---|
| 🎯 | **ATS Scoring** | Match score with matched & missing keywords vs any job description |
| ✨ | **AI Rewrite** | Before/after optimization with section-level AI suggestions |
| 🏗️ | **Resume Builder** | Build from scratch — drag to reorder skills, experience, projects |
| 📤 | **Multi-format Export** | DOCX · ATS PDF · Minimal PDF · Plain Text — no account needed |

---

## Project Structure

```
resume-builder/
  backend resume builder/        ← Spring Boot API
  frontend resume builder/
    resumefit-ai/                ← React + Vite frontend
```

---

## Frontend Setup

**Stack:** React 18 · Vite 5 · React Router · Axios · Lucide React

```bash
cd "frontend resume builder/resumefit-ai"
npm install
npm run dev
```

Override API URL via `.env`:

```env
VITE_API_URL=https://resumefit-ai-backend.onrender.com
```

**Netlify deploy:**
- Build command: `npm run build`
- Publish directory: `dist`
- SPA routing via `public/_redirects`

---

## Backend Setup

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

> **Note:** If Maven clean fails, a Java process is locking `target/` — stop it and retry.

---

## Environment Variables

> Set in your deployment provider (e.g. Render dashboard) — **never hardcode in source.**
> At minimum you need `APP_CORS_ALLOWED_ORIGINS` and **one AI provider key.**

| Variable | Default | Notes |
|---|---|---|
| `APP_CORS_ALLOWED_ORIGINS` | — | ⚠️ Required — comma-separated frontend origins |
| `GEMINI_API_KEY` | — | ⚠️ Min one AI key required |
| `GEMINI_MODEL` | `gemini-2.5-flash` | |
| `OPENROUTER_API_KEY` | — | Alternative AI provider |
| `OPENROUTER_MODEL` | `openai/gpt-4o-mini` | |
| `LOCAL_AI_ENABLED` | `false` | Set `true` for local Ollama |
| `LOCAL_AI_URL` | `http://localhost:11434` | |
| `SERVER_PORT` | `8080` | |

---

## API Reference

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
| `POST` | `/api/resume/builder/generate` | Build resume from structured profile data |
| `POST` | `/api/resume/builder/assist-section` | AI help for a single section |
| `POST` | `/api/resume/export/docx` | Export as DOCX |
| `POST` | `/api/resume/export/pdf/{style}` | Export as PDF — `ats`, `minimal`, or `template` |

**Key request fields:**

`/api/resume/match` & `/api/resume/optimize`
→ `resumeText` · `jobDescription` · `skills` · `candidateStage` · `roleType`

`/api/resume/builder/generate`
→ `fullName` · `skills` · `roleType` · `candidateLevel`

`/api/resume/export/pdf/{style}`
→ `resumeText` · `fileName` · `documentTitle` · `templateProfile`

---

## Docker — Render Deployment

Dockerfile included — builds with Maven, runs Java 17, uses `prod` Spring profile, reads port from `PORT` env var (fallback `8080`).

**Minimum required on Render:**

```
APP_CORS_ALLOWED_ORIGINS=https://your-frontend.netlify.app
GEMINI_API_KEY=your_key_here
```

---

## CORS

If API calls fail from the browser, the most common reason is a missing CORS origin.
Whenever the frontend domain changes → update `APP_CORS_ALLOWED_ORIGINS` → redeploy backend.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| **Backend not reachable** | Render free tier sleeps after inactivity — wait 30–60s on first request. Check deploy logs. |
| **"Only PDF and DOCX supported"** | TXT and image files not accepted. Scanned PDFs with no text layer also fail. |
| **Validation error on resume/JD** | Both must be 80–12000 characters — paste full content, not a title or summary. |
| **CORS error in browser** | Update `APP_CORS_ALLOWED_ORIGINS` with new frontend URL and redeploy backend. |

---

<div align="center">

> *"Built to help job seekers land more interviews — one optimized resume at a time."*

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:00d9ff,100:0f2027&height=100&section=footer&animation=fadeIn"/>

</div>

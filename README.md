# ResumeFit AI 🎯

A full-stack resume optimization platform that helps job seekers compare their resume against a job description, understand ATS gaps, improve specific sections, build a resume from scratch, and export recruiter-ready files.

**Live App →** [ai-resume-builder-cv-match.netlify.app](https://ai-resume-builder-cv-match.netlify.app)  
**Backend API →** [resumefit-ai-backend.onrender.com](https://resumefit-ai-backend.onrender.com)

---

## What it does

- Upload a resume (PDF or DOCX) and paste a job description
- Get an ATS match score with matched keywords, missing keywords, and skill gaps
- Optimize your resume draft with an AI-powered before/after comparison
- Edit individual sections with AI suggestions
- Build a resume from scratch using a structured form
- Reorder skills, experience, and projects with drag controls
- Export as DOCX, ATS PDF, minimal PDF, or plain text
- Everything persists in your browser session — no account needed

---

## Project structure

```
resume-builder/
  backend resume builder/       Spring Boot API
  frontend resume builder/
    resumefit-ai/               React + Vite frontend
```

---

## Frontend

**Stack:** React 18, Vite 5, React Router, Axios, Lucide React

```bash
cd "frontend resume builder/resumefit-ai"
npm install
npm run dev
```

To override the API URL, create a `.env` file:

```
VITE_API_URL=https://resumefit-ai-backend.onrender.com
```

**Deploy to Netlify:**
- Build command: `npm run build`
- Publish directory: `dist`
- SPA routing is handled via `public/_redirects`

---

## Backend

**Stack:** Java 17, Spring Boot 3.3.5, Maven, PDFBox, Apache POI, Lombok

```bash
cd "backend resume builder"
./mvnw spring-boot:run
```

**Windows:**
```powershell
cd "backend resume builder"
.\mvnw.cmd spring-boot:run
```

**Build a JAR:**
```bash
./mvnw clean package
```

> If Maven clean fails, a Java process is likely locking the `target/` folder. Stop it and retry.

---

## Backend environment variables

Set these in your deployment provider (e.g. Render dashboard) — never in code.

| Variable | Description |
|---|---|
| `SERVER_PORT` | Defaults to `8080` |
| `APP_CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins |
| `GEMINI_API_KEY` | Gemini AI provider key |
| `GEMINI_MODEL` | Defaults to `gemini-2.5-flash` |
| `OPENROUTER_API_KEY` | OpenRouter AI provider key |
| `OPENROUTER_MODEL` | Defaults to `openai/gpt-4o-mini` |
| `LOCAL_AI_ENABLED` | Set to `true` to use a local Ollama instance |
| `LOCAL_AI_URL` | Defaults to `http://localhost:11434` |

You need at least one AI provider key (Gemini or OpenRouter). If neither is set, the backend falls back to deterministic logic where available.

**Example CORS value:**
```
APP_CORS_ALLOWED_ORIGINS=https://ai-resume-builder-cv-match.netlify.app,http://localhost:5173
```

---

## API reference

Base path: `/api`

| Method | Endpoint | What it does |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/resume/parse` | Upload and parse a PDF or DOCX resume |
| POST | `/api/job-descriptions/analyze` | Extract keywords and role signals from a job description |
| POST | `/api/resume/match` | ATS match score against a job description |
| POST | `/api/resume/suggestions` | Section-level improvement suggestions |
| POST | `/api/resume/optimize` | Generate an optimized resume draft |
| POST | `/api/resume/versions` | Generate multiple resume variants |
| POST | `/api/resume/builder/generate` | Build a resume from structured profile data |
| POST | `/api/resume/builder/assist-section` | AI assistance for a single resume section |
| POST | `/api/resume/export/docx` | Export resume as DOCX |
| POST | `/api/resume/export/pdf/{style}` | Export resume as PDF — `ats`, `minimal`, or `template` |

**Key fields for common endpoints:**

`/api/resume/match` and `/api/resume/optimize` — `resumeText`, `jobDescription`, `skills`, `candidateStage`, `roleType`

`/api/resume/builder/generate` — `fullName`, `skills`, `roleType`, `candidateLevel`

`/api/resume/export/pdf/{style}` — `resumeText`, `fileName`, `documentTitle`, `templateProfile`

---

## Docker deployment (Render)

The backend ships with a Dockerfile. It builds with Maven, runs on Java 17, uses the `prod` Spring profile, and reads the port from the `PORT` environment variable (fallback: `8080`).

Set at minimum on Render:
- `APP_CORS_ALLOWED_ORIGINS`
- `GEMINI_API_KEY` or `OPENROUTER_API_KEY`

---

## CORS

If API calls fail from the browser, the most common reason is a missing CORS origin. Whenever the frontend domain changes, update `APP_CORS_ALLOWED_ORIGINS` and redeploy the backend.

---

## Troubleshooting

**Backend not reachable** — Render free tier sleeps after inactivity. Give it 30–60 seconds to wake up on the first request. Also check CORS and deployment logs.

**"Only PDF and DOCX resume files are supported"** — The parser does not accept TXT or image files. Scanned PDFs with no text layer will also fail.

**"Job description must be between 80 and 12000 characters"** — Paste the full job description, not just the title or a summary.

**"Resume text must be between 80 and 12000 characters"** — If an uploaded PDF parses as very short text, it may be a scanned image without a text layer.

---

## Tech overview

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite 5, Axios, Lucide React |
| Backend | Java 17, Spring Boot 3.3.5, Maven |
| PDF parsing | Apache PDFBox |
| DOCX parsing & export | Apache POI |
| AI providers | Google Gemini, OpenRouter (GPT-4o mini) |
| Frontend hosting | Netlify |
| Backend hosting | Render (Docker) |

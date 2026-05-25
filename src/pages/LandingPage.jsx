import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  Layers,
  Moon,
  Shield,
  Sun,
  Target,
  Zap,
} from 'lucide-react'
import { useApp } from '../app/AppContext.jsx'

const FEATURES = [
  {
    icon: Target,
    color: '#2563eb',
    bg: '#eff6ff',
    title: 'ATS Score Analysis',
    desc: 'Instantly see how your resume scores against any job description and what ATS systems are likely to miss.',
  },
  {
    icon: Zap,
    color: '#7c3aed',
    bg: '#f5f3ff',
    title: 'AI-Powered Optimization',
    desc: 'Rewrite bullet points, close keyword gaps, and improve recruiter readability with controlled AI suggestions.',
  },
  {
    icon: BarChart3,
    color: '#0891b2',
    bg: '#ecfeff',
    title: 'Skill Gap Detection',
    desc: 'Understand which skills are strong, partially matched, or missing for the exact role you are targeting.',
  },
  {
    icon: Shield,
    color: '#16a34a',
    bg: '#f0fdf4',
    title: 'Credibility Scoring',
    desc: 'Keep the resume honest and role-aligned instead of keyword-stuffed or fake-looking.',
  },
  {
    icon: Layers,
    color: '#d97706',
    bg: '#fffbeb',
    title: 'Resume Builder',
    desc: 'Create real sections from your own details with live preview, editing, and export-ready formatting.',
  },
  {
    icon: FileText,
    color: '#dc2626',
    bg: '#fef2f2',
    title: 'Multi-Format Export',
    desc: 'Export ATS PDF, minimal PDF, DOCX, and plain text from the current live draft.',
  },
]

const WORKFLOW = [
  { num: '1', title: 'Upload your resume', desc: 'Start from a PDF or DOCX and let the parser extract usable content.' },
  { num: '2', title: 'Paste the job description', desc: 'Use any real posting from LinkedIn, Indeed, or a company career page.' },
  { num: '3', title: 'Review the analysis', desc: 'See ATS score, matched skills, missing keywords, and concrete suggestions.' },
  { num: '4', title: 'Apply AI improvements', desc: 'Generate a stronger version while keeping the content editable and honest.' },
  { num: '5', title: 'Export and apply', desc: 'Download a recruiter-ready file in the format your application needs.' },
]

function ProductPreview() {
  return (
    <div className="hero-product-preview" aria-hidden="true">
      <div className="preview-titlebar">
        <span />
        <span />
        <span />
        <div className="preview-address">resumefit.ai / optimizer</div>
      </div>
      <div className="preview-body">
        <aside className="preview-sidebar">
          <div className="preview-logo-row">
            <div className="preview-logo-mark">
              <FileText size={12} />
            </div>
            <strong>ResumeFit AI</strong>
          </div>
          {['Dashboard', 'Optimizer', 'Builder', 'Exports'].map((item, index) => (
            <div key={item} className={`preview-nav-item ${index === 1 ? 'active' : ''}`}>
              {item}
            </div>
          ))}
        </aside>

        <main className="preview-main">
          <div className="preview-stats">
            {[
              ['ATS Score', '82', 'success'],
              ['Skills Matched', '14/18', 'accent'],
              ['Suggestions', '6', 'warning'],
            ].map(([label, value, tone]) => (
              <div key={label} className="preview-stat-card">
                <span>{label}</span>
                <strong className={`tone-${tone}`}>{value}</strong>
              </div>
            ))}
          </div>

          <section className="preview-analysis-card">
            <div className="preview-card-head">
              <span>Skill Analysis</span>
              <span>Role match</span>
            </div>
            {[
              ['React', 92, 'success'],
              ['TypeScript', 85, 'success'],
              ['System Design', 44, 'danger'],
              ['Kubernetes', 28, 'danger'],
            ].map(([skill, pct, tone]) => (
              <div key={skill} className="preview-skill-row">
                <div>
                  <span>{skill}</span>
                  <strong className={`tone-${tone}`}>{pct}%</strong>
                </div>
                <div className="preview-meter">
                  <span className={`tone-bg-${tone}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const { theme, toggleTheme } = useApp()

  return (
    <div className="landing">
      <header className="landing-nav">
        <Link to="/" className="landing-nav-logo" aria-label="ResumeFit AI home">
          <span className="landing-logo-mark">
            <FileText size={14} />
          </span>
          ResumeFit AI
        </Link>

        <nav className="landing-nav-links" aria-label="Primary navigation">
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#how-it-works" className="landing-nav-link">How it works</a>
          <button
            type="button"
            className="btn btn-icon btn-icon-sm"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
          <Link to="/dashboard" className="btn btn-ghost btn-sm">Workspace</Link>
          <Link to="/optimizer" className="btn btn-primary btn-sm">Try Free</Link>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-eyebrow">
            <Zap size={12} />
            AI-powered resume intelligence
          </div>

          <h1 className="hero-title">
            Get your resume <em>past the ATS</em> and in front of humans
          </h1>

          <p className="hero-sub">
            Match your resume to any job description, identify gaps, improve wording, and export a recruiter-ready version from one focused workspace.
          </p>

          <div className="stat-row">
            {[
              ['Instant', 'ATS scoring'],
              ['Precise', 'skill gaps'],
              ['Editable', 'AI rewrites'],
              ['4', 'export formats'],
            ].map(([value, label]) => (
              <div key={label} className="stat-pill">
                <CheckCircle2 size={12} />
                <strong>{value}</strong> {label}
              </div>
            ))}
          </div>

          <div className="hero-actions">
            <Link to="/optimizer" className="hero-btn-primary">
              <Zap size={16} />
              Optimize my resume
            </Link>
            <Link to="/builder" className="hero-btn-secondary">
              Build from scratch
              <ArrowRight size={15} />
            </Link>
          </div>

          <ProductPreview />
        </section>

        <section className="features-section" id="features">
          <div className="features-label">What ResumeFit AI does</div>
          <h2 className="features-heading">Everything needed to land the interview</h2>
          <p className="features-sub">
            A real product workflow for job seekers: parse, analyze, improve, build, and export without leaving the app.
          </p>

          <div className="landing-feature-grid">
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
              <article key={title} className="feature-card">
                <div className="feature-icon" style={{ background: bg, color }}>
                  <Icon size={20} />
                </div>
                <h3 className="feature-title">{title}</h3>
                <p className="feature-desc">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="workflow-section" id="how-it-works">
          <div className="workflow-head">
            <div className="features-label">How it works</div>
            <h2 className="features-heading">From upload to offer-ready export</h2>
          </div>

          <div className="workflow-steps">
            {WORKFLOW.map(({ num, title, desc }) => (
              <article key={num} className="workflow-step-card">
                <div className="workflow-step-num">{num}</div>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-cta">
          <div className="landing-cta-inner">
            <h2>Ready to beat the ATS?</h2>
            <p>Start with your current resume, paste a job description, and improve the draft with backend-powered analysis.</p>
            <div className="landing-cta-actions">
              <Link to="/optimizer" className="hero-btn-primary">
                <Zap size={16} />
                Start optimizing free
              </Link>
              <Link to="/builder" className="hero-btn-secondary">Build a resume</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <span className="landing-logo-mark">
            <FileText size={12} />
          </span>
          <strong>ResumeFit AI</strong>
        </div>
        <p className="footer-copy">AI-powered resume optimization platform</p>
        <div className="landing-footer-links">
          <Link to="/optimizer">Optimizer</Link>
          <Link to="/builder">Builder</Link>
          <Link to="/exports">Export</Link>
        </div>
      </footer>
    </div>
  )
}

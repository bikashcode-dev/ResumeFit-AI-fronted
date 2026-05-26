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
import BrandLogo from '../components/brand/BrandLogo.jsx'

const FEATURES = [
  {
    icon: Target,
    color: '#2563eb',
    bg: '#eff6ff',
    title: 'JD-to-resume scoring',
    desc: 'Compare your resume with a pasted job description and see which keywords, tools, and role signals are covered.',
  },
  {
    icon: Zap,
    color: '#7c3aed',
    bg: '#f5f3ff',
    title: 'Controlled rewrite support',
    desc: 'Improve summaries and bullets without inventing companies, dates, metrics, or skills you do not actually have.',
  },
  {
    icon: BarChart3,
    color: '#0891b2',
    bg: '#ecfeff',
    title: 'Skill gap map',
    desc: 'Separate must-have gaps from good-to-have gaps so you know what to add, explain, or leave out.',
  },
  {
    icon: Shield,
    color: '#16a34a',
    bg: '#f0fdf4',
    title: 'Credibility checks',
    desc: 'Flag weak claims and overstuffed wording before the resume reaches a recruiter.',
  },
  {
    icon: Layers,
    color: '#d97706',
    bg: '#fffbeb',
    title: 'Section-based builder',
    desc: 'Write profile, skills, projects, education, and experience in the order that fits your stage.',
  },
  {
    icon: FileText,
    color: '#dc2626',
    bg: '#fef2f2',
    title: 'Recruiter-ready export',
    desc: 'Download ATS PDF, minimal PDF, DOCX, or plain text from the draft you just reviewed.',
  },
]

const WORKFLOW = [
  { num: '1', title: 'Upload your resume', desc: 'Start from a PDF or DOCX and let the parser extract usable content.' },
  { num: '2', title: 'Paste the job description', desc: 'Use any real posting from LinkedIn, Indeed, or a company career page.' },
  { num: '3', title: 'Review the analysis', desc: 'Check score, matched skills, missing keywords, section order, and rewrite notes.' },
  { num: '4', title: 'Apply improvements', desc: 'Create a tighter draft, then review every section before export.' },
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
            <BrandLogo size={20} />
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
          <BrandLogo size={28} />
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
            ATS-focused resume workspace
          </div>

          <h1 className="hero-title">
            Tune your resume for the role before you apply
          </h1>

          <p className="hero-sub">
            Upload a resume, paste the JD, review the match, then edit and export a role-specific draft without losing control of the content.
          </p>

          <div className="stat-row">
            {[
              ['Role-based', 'ATS scoring'],
              ['Clear', 'skill gaps'],
              ['Reviewable', 'rewrites'],
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
          <h2 className="features-heading">Built around the resume decisions that matter</h2>
          <p className="features-sub">
            Every screen supports the same flow: parse the resume, compare it to the JD, fix weak sections, and export a clean draft.
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
            <h2>Check the next resume before sending it</h2>
            <p>Start with your current file, confirm your real skills, and turn the analysis into an editable draft.</p>
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
          <BrandLogo size={24} />
          <strong>ResumeFit AI</strong>
        </div>
        <p className="footer-copy">ATS analysis, resume editing, and export workflow</p>
        <div className="landing-footer-links">
          <Link to="/optimizer">Optimizer</Link>
          <Link to="/builder">Builder</Link>
          <Link to="/exports">Export</Link>
        </div>
      </footer>
    </div>
  )
}

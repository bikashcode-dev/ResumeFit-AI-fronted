import React from 'react'
import { FileText } from 'lucide-react'

function ContactLine({ value }) {
  if (!value) return null
  return <span className="resume-contact-item">{value}</span>
}

function Section({ title, children }) {
  if (!children) return null
  return (
    <section className="resume-section">
      <h3 className="resume-section-title">{title}</h3>
      {children}
    </section>
  )
}

export default function ResumePreview({ data }) {
  if (!data || (!data.name && !data.summary && !data.experience?.length)) {
    return (
      <div className="preview-empty">
        <div className="preview-empty-sheet" aria-hidden="true">
          <FileText size={28} />
        </div>
        <p className="preview-empty-title">No resume content yet</p>
        <p className="preview-empty-desc">
          Upload and analyze in the Optimizer, or enter your details in the Builder to see a live
          A4 preview here.
        </p>
      </div>
    )
  }

  const contact = data.contact || {}

  return (
    <div className="preview-scroll">
      <article className="resume-paper" aria-label="Resume document preview">
        <header className="resume-header">
          {data.name && <h1 className="resume-name">{data.name}</h1>}
          <div className="resume-contact-line">
            <ContactLine value={contact.email} />
            <ContactLine value={contact.phone} />
            <ContactLine value={contact.location} />
            <ContactLine value={contact.linkedin} />
            <ContactLine value={contact.github} />
            <ContactLine value={contact.portfolio} />
          </div>
        </header>

        {data.summary && (
          <Section title="Summary">
            <p className="resume-body-text">{data.summary}</p>
          </Section>
        )}

        {data.skills?.length > 0 && (
          <Section title="Skills">
            <p className="resume-body-text">
              {data.skills
                .map(s => (typeof s === 'string' ? s : s.name || ''))
                .filter(Boolean)
                .join(' · ')}
            </p>
          </Section>
        )}

        {data.experience?.length > 0 && (
          <Section title="Experience">
            {data.experience.map((exp, i) => (
              <div key={i} className="resume-entry">
                <div className="resume-entry-head">
                  <strong>{exp.title || exp.role}</strong>
                  <span>{exp.duration || exp.dates}</span>
                </div>
                {exp.company && <div className="resume-entry-sub">{exp.company}</div>}
                {exp.description && <p className="resume-bullet-text">{exp.description}</p>}
                {exp.bullets?.length > 0 && (
                  <ul className="resume-bullets">
                    {(Array.isArray(exp.bullets) ? exp.bullets : [exp.bullets]).map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </Section>
        )}

        {data.education?.length > 0 && (
          <Section title="Education">
            {data.education.map((edu, i) => (
              <div key={i} className="resume-entry">
                <strong>{edu.degree || edu.qualification}</strong>
                <div className="resume-entry-sub">{edu.institution || edu.school}</div>
                {edu.year && <div className="resume-entry-meta">{edu.year}</div>}
              </div>
            ))}
          </Section>
        )}

        {data.projects?.length > 0 && (
          <Section title="Projects">
            {data.projects.map((p, i) => (
              <div key={i} className="resume-entry">
                <strong>{p.name || p.title}</strong>
                {p.description && <p className="resume-bullet-text">{p.description}</p>}
              </div>
            ))}
          </Section>
        )}

        {data.certifications?.length > 0 && (
          <Section title="Certifications">
            <ul className="resume-bullets compact">
              {data.certifications.map((c, i) => (
                <li key={i}>{typeof c === 'string' ? c : c.name}</li>
              ))}
            </ul>
          </Section>
        )}

        {data.achievements?.length > 0 && (
          <Section title="Achievements">
            <ul className="resume-bullets compact">
              {data.achievements.map((a, i) => (
                <li key={i}>{typeof a === 'string' ? a : a.description}</li>
              ))}
            </ul>
          </Section>
        )}
      </article>
    </div>
  )
}

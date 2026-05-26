import React from 'react'

export default function BrandLogo({ size = 30, className = '', title = 'ResumeFit AI' }) {
  const id = `rf-logo-${size}`

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="12" y1="8" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563eb" />
          <stop offset="1" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id={`${id}-paper`} x1="23" y1="14" x2="44" y2="49" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#dbeafe" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="#0f172a" />
      <rect x="8" y="8" width="48" height="48" rx="14" fill={`url(#${id}-bg)`} />
      <path d="M22 15.5h15.8L46 23.7v24.8H22V15.5z" fill={`url(#${id}-paper)`} />
      <path d="M37.6 15.5v8.4H46" fill="#bfdbfe" />
      <path d="M27 29h14M27 35h14M27 41h8" stroke="#1e3a8a" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M20 47.5l7-7.1 5.2 5.2 11.5-12.2"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

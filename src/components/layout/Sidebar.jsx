import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Zap, PenTool, FileEdit, Download, Clock } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/optimizer', icon: Zap, label: 'Optimizer' },
  { to: '/builder', icon: PenTool, label: 'Resume Builder' },
  { to: '/editor', icon: FileEdit, label: 'Editor' },
  { to: '/exports', icon: Download, label: 'Export' },
  { to: '/history', icon: Clock, label: 'History' },
]

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`}>
      <div className="sidebar-logo">
        <NavLink to="/" className="sidebar-logo-link" onClick={onClose}>
          <div className="logo-mark">R</div>
          <div className="logo-text">
            Resume<span>Fit</span> AI
          </div>
        </NavLink>
      </div>

      <nav className="sidebar-nav" aria-label="Workspace">
        <div className="nav-section">
          <div className="nav-label">Workspace</div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={onClose}
            >
              <Icon size={15} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  )
}

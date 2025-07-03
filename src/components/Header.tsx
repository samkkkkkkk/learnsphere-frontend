import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const navItems = [
  { to: '/', label: '홈' },
  { to: '/roadmap', label: '로드맵' },
  { to: '/learning-manager', label: '학습매니저' },
];

export default function Header() {
  const location = useLocation();
  return (
    <header className="global-header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <span className="logo-icon"><i className="fas fa-brain"></i></span>
          <span className="logo-text">LearnSphere</span>
        </Link>
        <nav className="header-nav">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link${location.pathname === item.to ? ' active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
} 
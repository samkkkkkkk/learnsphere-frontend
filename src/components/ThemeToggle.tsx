import React, { useState } from 'react';
import Icon from './ui/Icon';

const THEME_KEY = 'learnsphere.theme';

/**
 * 다크(기본) ↔ 라이트 테마 토글.
 *
 * 색 토큰은 index.css의 `[data-theme='light']` 블록이 교체하고,
 * 첫 페인트 전 적용은 index.html의 인라인 스크립트가 담당한다.
 * 저장값이 없으면 다크가 기본이다 (브랜드 무드 유지).
 */
const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
  );

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'light') {
      document.documentElement.dataset.theme = 'light';
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // 저장 실패 시에도 이번 세션의 전환은 유지된다
    }
  };

  const label = theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환';

  return (
    <button
      type="button"
      className="nav-link theme-toggle"
      onClick={toggle}
      title={label}
      aria-label={label}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={14} />
    </button>
  );
};

export default ThemeToggle;

import React from 'react';
import { Link } from 'react-router-dom';
import './Breadcrumb.css';

export interface BreadcrumbItem {
  label: string;
  /** 링크 목적지 — 없으면 텍스트로 표시. 마지막 항목은 항상 현재 페이지 텍스트 */
  to?: string;
}

/** 현재 위치 경로 표시 (홈 / 과목 / 레벨 / 레슨). */
const Breadcrumb: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => (
  <nav className="breadcrumb" aria-label="현재 위치">
    <ol>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <li key={`${item.label}-${i}`} aria-current={isLast ? 'page' : undefined}>
            {item.to && !isLast ? (
              <Link to={item.to}>{item.label}</Link>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default Breadcrumb;

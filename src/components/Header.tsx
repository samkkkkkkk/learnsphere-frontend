import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <i className="fas fa-graduation-cap"></i>
          <h1>LearnSphere</h1>
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">홈</Link>
          <Link to="/roadmap" className="nav-link">로드맵</Link>
          <Link to="/learning-manager" className="nav-link">학습관리</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 
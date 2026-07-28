import { Link, NavLink } from 'react-router-dom';
import { useFocusManager } from '../contexts/FocusManagerContext';
import { useAuth } from '../contexts/AuthContext';
import Icon from './ui/Icon';
import ThemeToggle from './ThemeToggle';
import './Header.css';

const Header: React.FC = () => {
  const { openModal } = useFocusManager();
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <span className="logo-prompt" aria-hidden="true">&gt;_</span>
          <span className="logo-text">learnsphere</span>
        </Link>
        <nav className="nav" aria-label="주 메뉴">
          <div className="nav-group">
            <NavLink to="/" end className="nav-link">홈</NavLink>
            <NavLink to="/roadmap" className="nav-link">로드맵</NavLink>
            <NavLink to="/react-learn" className="nav-link">학습하기</NavLink>
            <NavLink to="/learning-manager" className="nav-link">학습관리</NavLink>
            <button onClick={openModal} className="nav-link focus-manager-btn">
              <Icon name="zap" size={14} />
              집중력 매니저
            </button>
            {/* <NavLink to="/wireframe" className="nav-link">와이어프레임</NavLink>
            <NavLink to="/admin" className="nav-link">관리자</NavLink> */}
          </div>

          <div className="nav-group nav-auth">
            <ThemeToggle />
            {isLoading ? (
              /* 세션 복원 중 — 자리를 유지해 레이아웃 흔들림(CLS) 방지 */
              <span className="nav-auth-placeholder" aria-hidden="true" />
            ) : user ? (
              <>
                <span className="nav-nickname">{user.nickname}님</span>
                <button className="nav-link nav-auth-btn" onClick={logout}>
                  로그아웃
                </button>
              </>
            ) : (
              <NavLink to="/login" className="nav-link">
                로그인
              </NavLink>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

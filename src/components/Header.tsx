import { Link } from 'react-router-dom';
import { useFocusManager } from '../contexts/FocusManagerContext';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const { openModal } = useFocusManager();
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <i className="fas fa-graduation-cap"></i>
          <h1>LearnSphere</h1>
        </Link>
        <nav className="nav">
          <div className="nav-group">
            <Link to="/" className="nav-link">홈</Link>
            <Link to="/roadmap" className="nav-link">로드맵</Link>
            <Link to="/react-learn" className="nav-link">학습하기</Link>
            {/* <Link to="/learning-manager" className="nav-link">학습관리</Link> */}
            <button 
              onClick={openModal}
              className="nav-link focus-manager-btn"
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: 'inherit',
                padding: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="fas fa-bolt"></i>
              집중력 매니저
            </button>
            {/* <Link to="/wireframe" className="nav-link">와이어프레임</Link>
            <Link to="/admin" className="nav-link">관리자</Link> */}
          </div>

          {/* 복원 중에는 로그인/닉네임이 깜빡이지 않도록 아무것도 보여주지 않는다 */}
          {!isLoading && (
            <div className="nav-group nav-auth">
              {user ? (
                <>
                  <span className="nav-nickname">{user.nickname}님</span>
                  <button className="nav-link nav-auth-btn" onClick={logout}>
                    로그아웃
                  </button>
                </>
              ) : (
                <Link to="/login" className="nav-link">
                  로그인
                </Link>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header; 
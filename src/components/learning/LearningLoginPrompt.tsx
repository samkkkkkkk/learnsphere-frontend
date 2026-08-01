// 미로그인 상태의 학습 매니저 안내 (ChatLoginPrompt 패턴)
import { Link } from 'react-router-dom';

export default function LearningLoginPrompt() {
  return (
    <div className="lm-layout">
      <div className="lm-main">
        <div className="container">
          <section className="section active">
            <div className="empty-state">
              <i className="fas fa-lock"></i>
              <p>
                학습 목표와 일정은 계정에 저장됩니다.
                <br />
                학습 매니저를 사용하려면 로그인이 필요합니다.
              </p>
              <Link
                to="/login"
                state={{ from: '/learning-manager' }}
                className="btn btn-primary"
              >
                로그인하러 가기
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

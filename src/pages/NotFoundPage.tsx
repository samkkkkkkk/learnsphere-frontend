import { Link } from 'react-router-dom';
import './NotFoundPage.css';

/** 존재하지 않는 경로 안내 — 홈/학습하기로 이동을 유도한다. */
export default function NotFoundPage() {
  return (
    <div className="not-found">
      <p className="not-found__code" aria-hidden="true">404: page not found</p>
      <h1>여기엔 아직 아무것도 없어요</h1>
      <p className="not-found__desc">
        주소가 바뀌었거나 잘못 입력된 것 같아요. 홈에서 다시 시작하거나 학습을 이어가 보세요.
      </p>
      <div className="not-found__actions">
        <Link to="/" className="not-found__btn not-found__btn--primary">홈으로 이동</Link>
        <Link to="/react-learn" className="not-found__btn">학습하기</Link>
      </div>
    </div>
  );
}

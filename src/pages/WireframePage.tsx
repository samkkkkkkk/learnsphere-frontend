import React from 'react';
import styles from './WireframePage.module.css';

const WireframePage: React.FC = () => (
  <div className={styles.container}>
    <div className={styles.header}>
      <h1>🗺️ 학습로드맵 시스템</h1>
      <p>프론트엔드 UX/UI 설계 - 화면별 구성</p>
    </div>
    <div className={styles['screens-grid']}>
      {/* 1. 메인 대시보드 */}
      <div className={`${styles.screen} ${styles.dashboard}`}>
        <div className={styles['screen-title']}>1. 메인 대시보드</div>
        <div className={styles['screen-content']}>
          <div className={styles.component}>
            <div className={styles['component-title']}>📊 주요 지표</div>
            <div className={styles['dashboard-widgets']}>
              <div className={styles.widget}>
                <div className={styles['widget-value']}>24</div>
                <div className={styles['widget-label']}>생성된 로드맵</div>
              </div>
              <div className={styles.widget}>
                <div className={styles['widget-value']}>156</div>
                <div className={styles['widget-label']}>학습 요소</div>
              </div>
              <div className={styles.widget}>
                <div className={styles['widget-value']}>89</div>
                <div className={styles['widget-label']}>검증 완료</div>
              </div>
            </div>
          </div>
          <div className={styles.component}>
            <div className={styles['component-title']}>🚀 빠른 실행</div>
            <div className={styles['component-items']}>
              <button className={styles.button}>+ 새 로드맵 생성</button>
              <button className={`${styles.button} ${styles.secondary}`}>🔄 배치 검증 실행</button>
              <button className={`${styles.button} ${styles.secondary}`}>🔧 AI 보완 실행</button>
            </div>
          </div>
          <div className={styles.component}>
            <div className={styles['component-title']}>📋 최근 생성 로드맵</div>
            <div className={styles['component-items']}>
              <div className={styles.item}>React 기초학습 (2시간 전)</div>
              <div className={styles.item}>Python 데이터분석 (1일 전)</div>
              <div className={styles.item}>JavaScript ES6+ (3일 전)</div>
            </div>
          </div>
        </div>
      </div>
      {/* 2. 로드맵 생성/조회 */}
      <div className={styles.screen}>
        <div className={styles['screen-title']}>2. 로드맵 생성/조회</div>
        <div className={styles['screen-content']}>
          <div className={styles.component}>
            <div className={styles['component-title']}>📝 입력 폼</div>
            <div className={styles['input-form']}>
              <input type="text" className={styles['input-field']} placeholder="주제 (예: React, Python)" />
              <select className={styles['input-field']}>
                <option>초급</option>
                <option>중급</option>
                <option>고급</option>
              </select>
              <input type="text" className={styles['input-field']} placeholder="중점분야" />
              <button className={styles.button}>🤖 AI 로드맵 생성</button>
            </div>
          </div>
          <div className={styles.component}>
            <div className={styles['component-title']}>🎯 생성 결과</div>
            <div className={`${styles['preview-area']} ${styles['mindmap-preview']}`}>
              HTML 마인드맵 미리보기<br />
              <small>(iframe/HTML 뷰)</small>
            </div>
            <button className={`${styles.button} ${styles.secondary}`}>💾 Qdrant 저장</button>
          </div>
        </div>
      </div>
      {/* 3. HTML 업로드/파싱 */}
      <div className={styles.screen}>
        <div className={styles['screen-title']}>3. HTML 업로드/파싱</div>
        <div className={styles['screen-content']}>
          <div className={styles.component}>
            <div className={styles['component-title']}>📤 파일 업로드</div>
            <div className={styles['upload-area']}>
              <div>📁 HTML 파일을 드래그하거나 클릭하여 업로드</div>
              <small>(.html, .htm 파일만 지원)</small>
            </div>
          </div>
          <div className={styles.component}>
            <div className={styles['component-title']}>🔍 파싱 결과</div>
            <div className={styles['preview-area']}>
              파싱된 노드/링크 미리보기<br />
              <small>노드: 12개, 링크: 8개</small>
            </div>
            <button className={`${styles.button} ${styles.secondary}`}>💾 Qdrant 저장</button>
          </div>
        </div>
      </div>
      {/* 4. DB → HTML 재생성 */}
      <div className={styles.screen}>
        <div className={styles['screen-title']}>4. DB → HTML 재생성</div>
        <div className={styles['screen-content']}>
          <div className={styles.component}>
            <div className={styles['component-title']}>🔎 검색 조건</div>
            <div className={styles['input-form']}>
              <input type="text" className={styles['input-field']} placeholder="주제 검색" />
              <select className={styles['input-field']}>
                <option>모든 난이도</option>
                <option>초급</option>
                <option>중급</option>
                <option>고급</option>
              </select>
              <button className={styles.button}>🔄 HTML 재생성</button>
            </div>
          </div>
          <div className={styles.component}>
            <div className={styles['component-title']}>📄 재생성 결과</div>
            <div className={styles['preview-area']}>
              재생성된 HTML 미리보기
            </div>
            <button className={`${styles.button} ${styles.secondary}`}>⬇️ 다운로드</button>
          </div>
        </div>
      </div>
      {/* 5. AI 배치 검증/보완 */}
      <div className={styles.screen}>
        <div className={styles['screen-title']}>5. AI 배치 검증/보완</div>
        <div className={styles['screen-content']}>
          <div className={styles.component}>
            <div className={styles['component-title']}>⚡ 배치 실행</div>
            <div className={styles['component-items']}>
              <button className={styles.button}>🔍 검증 배치 실행</button>
              <button className={`${styles.button} ${styles.secondary}`}>🔧 보완 배치 실행</button>
              <div className={styles.item}>
                <span className={`${styles['status-badge']} ${styles['status-success']}`}>실행 중</span>
                검증 진행률: 67%
              </div>
            </div>
          </div>
          <div className={styles.component}>
            <div className={styles['component-title']}>📊 검증/보완 결과</div>
            <div className={styles['preview-area']}>
              변경된 노드: 5개<br />
              새로운 링크: 3개<br />
              개선 사항: 8개
            </div>
          </div>
        </div>
      </div>
      {/* 6. 변경 로그/이력 */}
      <div className={styles.screen}>
        <div className={styles['screen-title']}>6. 변경 로그/이력</div>
        <div className={styles['screen-content']}>
          <div className={styles.component}>
            <div className={styles['component-title']}>📋 변경 이력</div>
            <div className={styles['log-table']}>
              <div className={styles['log-header']}>
                <div>날짜/시간</div>
                <div>변경 내용</div>
                <div>상태</div>
              </div>
              <div className={styles['log-row']}>
                <div>2024-01-15 14:30</div>
                <div>React 로드맵 보완</div>
                <div><span className={`${styles['status-badge']} ${styles['status-success']}`}>완료</span></div>
              </div>
              <div className={styles['log-row']}>
                <div>2024-01-15 13:45</div>
                <div>Python 링크 검증</div>
                <div><span className={`${styles['status-badge']} ${styles['status-pending']}`}>진행중</span></div>
              </div>
              <div className={styles['log-row']}>
                <div>2024-01-15 12:20</div>
                <div>JavaScript 노드 추가</div>
                <div><span className={`${styles['status-badge']} ${styles['status-error']}`}>실패</span></div>
              </div>
            </div>
          </div>
          <div className={styles.component}>
            <div className={styles['component-title']}>🔍 필터/검색</div>
            <div className={styles['input-form']}>
              <input type="text" className={styles['input-field']} placeholder="검색어 입력" />
              <button className={`${styles.button} ${styles.secondary}`}>⬇️ 로그 다운로드</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className={styles['flow-arrows']}>
      <span className={styles.arrow}>↓</span>
      <span className={styles.arrow}>→</span>
      <span className={styles.arrow}>↓</span>
      <span className={styles.arrow}>→</span>
      <span className={styles.arrow}>↓</span>
    </div>
  </div>
);

export default WireframePage; 
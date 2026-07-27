import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import Spinner from './components/ui/Spinner';
import { FocusManagerProvider } from './contexts/FocusManagerContext';
import { ChatWidgetProvider } from './contexts/ChatWidgetContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/ToastContext';
import FocusManagerModal from './pages/FocusManagerModal';
import ChatWidget from './components/chat/ChatWidget';

// 라우트별 code splitting — 초기 번들에서 페이지 코드를 분리한다
const MainPage = lazy(() => import('./pages/MainPage'));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage'));
const ReactLearnPage = lazy(() => import('./pages/ReactLearnPage'));
const LMSPage = lazy(() => import('./pages/LMSPage'));
const LearningManagerPage = lazy(() => import('./pages/LearningManagerPage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const WireframePage = lazy(() => import('./pages/WireframePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  return (
    <AuthProvider>
    <ToastProvider>
    <FocusManagerProvider>
      <ChatWidgetProvider>
        <Header />
        <ErrorBoundary>
          <Suspense fallback={<Spinner label="페이지를 불러오는 중" />}>
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/roadmap" element={<RoadmapPage />} />
              <Route path="/learning-manager" element={<LearningManagerPage />} />
              <Route path="/react-learn" element={<ReactLearnPage />} />
              <Route path="/lms" element={<LMSPage />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path='/wireframe' element={<WireframePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        <FocusManagerModal />
        <ChatWidget />
      </ChatWidgetProvider>
    </FocusManagerProvider>
    </ToastProvider>
    </AuthProvider>
  );
}

export default App;

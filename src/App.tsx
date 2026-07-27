import { Routes, Route } from 'react-router-dom';
import RoadmapPage from './pages/RoadmapPage';
import MainPage from './pages/MainPage';
import LearningManagerPage from './pages/LearningManagerPage';
import ReactLearnPage from './pages/ReactLearnPage';
import AdminPanel from './pages/AdminPanel';
import Header from './components/Header';
import { FocusManagerProvider } from './contexts/FocusManagerContext';
import FocusManagerModal from './pages/FocusManagerModal';
import WireframePage from './pages/WireframePage';
import { ChatWidgetProvider } from './contexts/ChatWidgetContext';
import ChatWidget from './components/chat/ChatWidget';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import { ToastProvider } from './components/ui/ToastContext';

function App() {
  return (
    <AuthProvider>
    <ToastProvider>
    <FocusManagerProvider>
      <ChatWidgetProvider>
        <Header />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/learning-manager" element={<LearningManagerPage />} />
          <Route path="/react-learn" element={<ReactLearnPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path='/wireframe' element={<WireframePage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
        <FocusManagerModal />
        <ChatWidget />
      </ChatWidgetProvider>
    </FocusManagerProvider>
    </ToastProvider>
    </AuthProvider>
  );
}

export default App;

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

function App() {
  return (
    <FocusManagerProvider>
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/learning-manager" element={<LearningManagerPage />} />
        <Route path="/react-learn" element={<ReactLearnPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path='/wireframe' element={<WireframePage />} />
      </Routes>
      <FocusManagerModal />
    </FocusManagerProvider>
  );
}

export default App;

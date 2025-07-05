import { Routes, Route } from 'react-router-dom';
import RoadmapPage from './pages/RoadmapPage';
import MainPage from './pages/MainPage';
import LearningManagerPage from './pages/LearningManagerPage';
import Header from './components/Header';
import { FocusManagerProvider } from './contexts/FocusManagerContext';
import FocusManagerModal from './pages/FocusManagerModal';

function App() {
  return (
    <FocusManagerProvider>
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/learning-manager" element={<LearningManagerPage />} />
      </Routes>
      <FocusManagerModal />
    </FocusManagerProvider>
  );
}

export default App;

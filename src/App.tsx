import { Routes, Route } from 'react-router-dom';
import RoadmapPage from './pages/RoadmapPage';
import MainPage from './pages/MainPage';
import LearningManagerPage from './pages/LearningManagerPage';
import ReactLearnPage from './pages/ReactLearnPage';
import ReactLearnPage2 from './pages/ReactLearnPage2';
import ReactLearnPage3 from './pages/ReactLearnPage3';
import ReactLearnPage4 from './pages/ReactLearnPage4';
import ReactLearnPage5 from './pages/ReactLearnPage5';
import ReactLearnPage6 from './pages/ReactLearnPage6';
import ReactLearnPage7 from './pages/ReactLearnPage7';
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
        <Route path="/react-learn2" element={<ReactLearnPage2 />} />
        <Route path="/react-learn3" element={<ReactLearnPage3 />} />
        <Route path="/react-learn4" element={<ReactLearnPage4 />} />
        <Route path="/react-learn5" element={<ReactLearnPage5 />} />
        <Route path="/react-learn6" element={<ReactLearnPage6 />} />
        <Route path="/react-learn7" element={<ReactLearnPage7 />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path='wireframe' element={<WireframePage />} />
      </Routes>
      <FocusManagerModal />
    </FocusManagerProvider>
  );
}

export default App;

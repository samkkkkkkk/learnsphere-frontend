import { Routes, Route } from 'react-router-dom';
import RoadmapPage from './pages/RoadmapPage';
import MainPage from './pages/MainPage';
import LearningManagerPage from './pages/LearningManagerPage';
import Header from './components/Header';
import WakeUpPage from './pages/WakeUpPage';


function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/learning-manager" element={<LearningManagerPage />} />
        <Route path="/wake-up" element={<WakeUpPage />} />
      </Routes>
    </>
  );
}

export default App;

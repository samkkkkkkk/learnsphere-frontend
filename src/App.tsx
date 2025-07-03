import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import RoadmapPage from './pages/RoadmapPage';

function Home() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    fetch('http://localhost:8000/api/hello/')
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);
  return (
    <>
      <div>
        <img src={viteLogo} className='logo' alt='Vite logo' />
        <img src={reactLogo} className='logo react' alt='React logo' />
      </div>
      <h1>LearnSphere</h1>
      <div className='card'>
        <p>
          Message from backend: <strong>{message || 'Loading...'}</strong>
        </p>
      </div>
      <nav style={{ marginTop: 24 }}>
        <Link to="/roadmap">React 학습 로드맵 바로가기</Link>
      </nav>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/roadmap" element={<RoadmapPage />} />
    </Routes>
  );
}

export default App;

import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

function App() {
  // const [count, setCount] = useState(0);

  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/hello/')
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error('Error fetching data:', error));
  }, []); // 빈 배열은 컴포넌트가 마운트될 때 한 번만 실행됨을 의미합니다.

  //   return (
  //     <>
  //       <div>
  //         <a href='https://vite.dev' target='_blank'>
  //           <img src={viteLogo} className='logo' alt='Vite logo' />
  //         </a>
  //         <a href='https://react.dev' target='_blank'>
  //           <img src={reactLogo} className='logo react' alt='React logo' />
  //         </a>
  //       </div>
  //       <h1>Vite + React</h1>
  //       <div className='card'>
  //         <button onClick={() => setCount((count) => count + 1)}>
  //           count is {count}
  //         </button>
  //         <p>
  //           Edit <code>src/App.tsx</code> and save to test HMR
  //         </p>
  //       </div>
  //       <p className='read-the-docs'>
  //         Click on the Vite and React logos to learn more
  //       </p>
  //     </>
  //   );

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
    </>
  );
}

export default App;

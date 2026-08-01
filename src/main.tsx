import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 셀프호스팅 웹폰트 — CDN 렌더 블로킹 CSS 대신 번들에 포함, 폰트 파일은 같은 오리진에서 서빙
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/700.css'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

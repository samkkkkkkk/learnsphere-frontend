import React, { useEffect, useRef, useState } from 'react';
import { useFocusManager } from '../contexts/FocusManagerContext';

const EAR_THRESHOLD_DEFAULT = 0.25;

const mediapipeUrl = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.js';

const FocusManagerModal: React.FC = () => {
  const { isOpen, isMinimized, closeModal, minimizeModal, restoreModal } = useFocusManager();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [earThreshold, setEarThreshold] = useState(EAR_THRESHOLD_DEFAULT);
  const [alerts, setAlerts] = useState<{ drowsy: boolean; absence: boolean; attention: boolean }>({ drowsy: false, absence: false, attention: false });
  const faceLandmarkerRef = useRef<any>(null);
  const lastVideoTimeRef = useRef(-1);
  const drowsyCounterRef = useRef(0);
  const headNodCounterRef = useRef(0);
  const absenceCounterRef = useRef(0);
  const attentionLapseCounterRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const alertTimeouts = useRef<{ drowsy: ReturnType<typeof setTimeout> | null; absence: ReturnType<typeof setTimeout> | null; attention: ReturnType<typeof setTimeout> | null }>({ drowsy: null, absence: null, attention: null });
  const predictWebcamRef = useRef<() => void>(() => {});

  // 음성 안내
  function speak(text: string) {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) return;
      window.speechSynthesis.cancel();
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  }

  function showAlert(type: 'drowsy' | 'absence' | 'attention', message: string) {
    setAlerts(prev => {
      if (prev[type]) return prev; // 이미 알림이 떠 있으면 중복 호출 방지
      speak(message);
      if (alertTimeouts.current[type]) clearTimeout(alertTimeouts.current[type]!);
      alertTimeouts.current[type] = setTimeout(() => {
        setAlerts(a => ({ ...a, [type]: false }));
        alertTimeouts.current[type] = null;
      }, 2000);
      return { ...prev, [type]: true };
    });
  }

  // 거리 계산
  function getDistance(p1: any, p2: any) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }
  function calculateEAR(eye: any[]) {
    const verticalDist = getDistance(eye[1], eye[5]) + getDistance(eye[2], eye[4]);
    const horizontalDist = getDistance(eye[0], eye[3]);
    return verticalDist / (2.0 * horizontalDist);
  }

  useEffect(() => {
    if (!isOpen) {
      // 모달이 닫힐 때 자원 해제
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      window.speechSynthesis.cancel();
      return;
    }
    let FaceLandmarker: any;
    let FilesetResolver: any;
    let running = true;

    async function loadMediaPipe() {
      try {
        // @ts-ignore
        const visionModule = await import(/* @vite-ignore */ mediapipeUrl);
        FaceLandmarker = visionModule.FaceLandmarker;
        FilesetResolver = visionModule.FilesetResolver;
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(
          filesetResolver,
          {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numFaces: 1,
            outputFacialTransformationMatrixes: true,
          }
        );
        return true;
      } catch (err) {
        console.error('MediaPipe import error:', err);
        return false;
      }
    }

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            predictWebcam();
          };
        } else {
          const checkVideoRef = () => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.onloadeddata = () => {
                predictWebcam();
              };
            } else {
              setTimeout(checkVideoRef, 100);
            }
          };
          checkVideoRef();
        }
      } catch (err) {
        console.error('Camera access error:', err);
        alert('웹캠 접근 오류: ' + err);
      }
    }

    async function loadAndStart() {
      const mediaPipeLoaded = await loadMediaPipe();
      if (mediaPipeLoaded) {
        await startCamera();
      }
    }

    function predictWebcam() {
      if (!running) return;
      const video = videoRef.current;
      if (!video || !faceLandmarkerRef.current) {
        animationRef.current = requestAnimationFrame(predictWebcam);
        return;
      }
      if (video.paused || video.ended || lastVideoTimeRef.current === video.currentTime || video.videoWidth === 0 || video.videoHeight === 0) {
        animationRef.current = requestAnimationFrame(predictWebcam);
        return;
      }
      lastVideoTimeRef.current = video.currentTime;
      const results = faceLandmarkerRef.current.detectForVideo(video, performance.now());
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        absenceCounterRef.current = 0;
        const landmarks = results.faceLandmarks[0];
        const leftEye = [362, 385, 387, 263, 373, 398].map((i: number) => landmarks[i]);
        const rightEye = [33, 160, 158, 133, 153, 144].map((i: number) => landmarks[i]);
        const avgEAR = (calculateEAR(leftEye) + calculateEAR(rightEye)) / 2.0;
        if (avgEAR < earThreshold) {
          drowsyCounterRef.current++;
        } else {
          drowsyCounterRef.current = 0;
        }
        if (results.facialTransformationMatrixes && results.facialTransformationMatrixes.length > 0) {
          const matrix = results.facialTransformationMatrixes[0].data;
          const yaw = Math.atan2(matrix[8], matrix[10]) * (180 / Math.PI);
          const pitch = Math.asin(-matrix[9]) * (180 / Math.PI);
          if (Math.abs(yaw) > 20) {
            attentionLapseCounterRef.current++;
          } else {
            attentionLapseCounterRef.current = 0;
          }
          if (pitch > 15) {
            headNodCounterRef.current++;
          } else {
            headNodCounterRef.current = 0;
          }
          if (attentionLapseCounterRef.current > 60) {
            showAlert('attention', '화면에 집중해주세요.');
          }
        }
        if ((drowsyCounterRef.current >= 48 || headNodCounterRef.current >= 48)) {
          showAlert('drowsy', '졸음이 감지되었습니다.');
        }
      } else {
        drowsyCounterRef.current = 0;
        attentionLapseCounterRef.current = 0;
        headNodCounterRef.current = 0;
        absenceCounterRef.current++;
        if (absenceCounterRef.current >= 90) {
          showAlert('absence', '자리를 비우셨나요?');
        }
      }
      animationRef.current = requestAnimationFrame(predictWebcam);
    }

    predictWebcamRef.current = predictWebcam;

    loadAndStart();
    return () => {
      running = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      window.speechSynthesis.cancel();
    };
  }, [isOpen]); // isOpen 의존성 추가

  // 복원 시 predictWebcam 재시작
  useEffect(() => {
    if (!isMinimized && videoRef.current && faceLandmarkerRef.current) {
      if (videoRef.current.readyState >= 2) {
        predictWebcamRef.current();
      } else {
        videoRef.current.onloadeddata = () => {
          predictWebcamRef.current();
        };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMinimized]);

  if (!isOpen) return null;

  return (
    <>
      <div style={{ display: isMinimized ? 'none' : 'block' }}>
        <div className="modal active" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ position: 'relative', background: '#34495e', color: 'white', borderRadius: 10, padding: 12, width: 680, maxWidth: '95vw' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer', zIndex: 10 }}>&times;</button>
            <button onClick={minimizeModal} style={{ position: 'absolute', top: 16, right: 56, background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', zIndex: 10 }} title="최소화">&#8211;</button>
            <h2 style={{ marginBottom: 16 }}>AI 집중력 매니저</h2>
            <div style={{ position: 'relative', width: 640, height: 480, margin: '0 auto 16px auto', border: '4px solid #3498db', borderRadius: 10, overflow: 'visible' }}>
              <video ref={videoRef} width={640} height={480} autoPlay playsInline style={{ display: 'block', transform: 'scaleX(-1)', objectFit: 'contain', width: '100%', height: '100%' }} />
              {/* 알림 */}
              {alerts.drowsy && <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#e74c3c', color: 'white', padding: '10px 20px', borderRadius: 5, fontSize: '1.5em', fontWeight: 'bold', zIndex: 10 }}>졸음 감지!</div>}
              {alerts.absence && <div style={{ position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)', background: '#3498db', color: 'white', padding: '10px 20px', borderRadius: 5, fontSize: '1.5em', fontWeight: 'bold', zIndex: 10 }}>자리를 비우셨나요?</div>}
              {alerts.attention && <div style={{ position: 'absolute', top: 100, left: '50%', transform: 'translateX(-50%)', background: '#f39c12', color: 'white', padding: '10px 20px', borderRadius: 5, fontSize: '1.5em', fontWeight: 'bold', zIndex: 10 }}>집중하세요!</div>}
            </div>
            <div style={{ background: '#222', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 15, marginTop: 12 }}>
              <label htmlFor="ear-slider">졸음 민감도 (높을수록 민감)</label>
              <input type="range" id="ear-slider" min={0.15} max={0.35} step={0.01} value={earThreshold} onChange={e => setEarThreshold(Number(e.target.value))} />
              <span>{earThreshold.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      {isMinimized && (
        <button
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1100,
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: 60,
            height: 60,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontSize: 32,
            cursor: 'pointer',
          }}
          title="AI 집중력 매니저 복원"
          onClick={restoreModal}
        >
          <span role="img" aria-label="restore">🔍</span>
        </button>
      )}
    </>
  );
};

export default FocusManagerModal; 
import React, { useEffect, useRef, useState } from 'react';

interface WakeUpModalProps {
  onClose: () => void;
}

const WakeUpModal: React.FC<WakeUpModalProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [earThreshold, setEarThreshold] = useState(0.25);
  const [earValue, setEarValue] = useState(0.25);
  const [alerts, setAlerts] = useState<{drowsy: boolean, absence: boolean, attention: boolean}>({drowsy: false, absence: false, attention: false});
  const [minimized, setMinimized] = useState(false);

  // Mediapipe 관련 상태
  const faceLandmarkerRef = useRef<any>(null);
  const lastVideoTimeRef = useRef(-1);
  const drowsyCounterRef = useRef(0);
  const headNodCounterRef = useRef(0);
  const isDrowsyAlertActiveRef = useRef(false);
  const absenceCounterRef = useRef(0);
  const isAbsenceAlertActiveRef = useRef(false);
  const attentionLapseCounterRef = useRef(0);
  const isAttentionAlertActiveRef = useRef(false);

  // 상수
  const DROWSY_CONSECUTIVE_FRAMES = 48;
  const PITCH_THRESHOLD_DEGREES = 15;
  const ABSENCE_THRESHOLD_SECONDS = 3;
  const YAW_THRESHOLD_DEGREES = 20;
  const ATTENTION_LAPSE_SECONDS = 2;

  // 음성 안내
  function speak(text: string) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 1.2;
      window.speechSynthesis.speak(utterance);
    }
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

  // 웹캠 해제 함수
  function stopWebcam() {
    if (streamRef.current) {
      console.log('Stopping webcam tracks:', streamRef.current.getTracks());
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      console.log('videoRef srcObject set to null');
    }
    window.speechSynthesis.cancel();
  }

  const predictWebcamRef = useRef<(() => void) | null>(null);

  // Mediapipe 로딩 및 웹캠 시작
  useEffect(() => {
    let vision: any;
    let DrawingUtils: any;
    let FaceLandmarker: any;
    let FilesetResolver: any;
    let running = true;

    async function loadAndStart() {
      // @ts-ignore
      const visionModule = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.js');
      DrawingUtils = visionModule.DrawingUtils;
      FaceLandmarker = visionModule.FaceLandmarker;
      FilesetResolver = visionModule.FilesetResolver;
      vision = visionModule;
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
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            predictWebcam();
          };
        }
      } catch (err) {
        alert('웹캠 접근 오류: ' + err);
      }
    }

    function predictWebcam() {
      if (!running) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !faceLandmarkerRef.current) {
        requestAnimationFrame(predictWebcam);
        return;
      }
      if (video.paused || video.ended || lastVideoTimeRef.current === video.currentTime) {
        requestAnimationFrame(predictWebcam);
        return;
      }
      lastVideoTimeRef.current = video.currentTime;
      const results = faceLandmarkerRef.current.detectForVideo(video, performance.now());
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      // 상태 초기화
      let drowsy = false, absence = false, attention = false;

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        if (absenceCounterRef.current > 0) absenceCounterRef.current = 0;
        if (isAbsenceAlertActiveRef.current) isAbsenceAlertActiveRef.current = false;

        const landmarks = results.faceLandmarks[0];
        const drawingUtils = new DrawingUtils(ctx);
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_TESSELATION,
          { color: '#C0C0C070', lineWidth: 1 }
        );
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

          if (Math.abs(yaw) > YAW_THRESHOLD_DEGREES) {
            attentionLapseCounterRef.current++;
          } else {
            attentionLapseCounterRef.current = 0;
          }
          if (pitch > PITCH_THRESHOLD_DEGREES) {
            headNodCounterRef.current++;
          } else {
            headNodCounterRef.current = 0;
          }

          if (
            attentionLapseCounterRef.current > ATTENTION_LAPSE_SECONDS * 30 &&
            !isAttentionAlertActiveRef.current
          ) {
            isAttentionAlertActiveRef.current = true;
            attention = true;
            speak('화면에 집중해주세요.');
            setTimeout(() => {
              isAttentionAlertActiveRef.current = false;
              setAlerts(a => ({ ...a, attention: false }));
            }, 2000);
          }
        }

        if (
          (drowsyCounterRef.current >= DROWSY_CONSECUTIVE_FRAMES ||
            headNodCounterRef.current >= DROWSY_CONSECUTIVE_FRAMES) &&
          !isDrowsyAlertActiveRef.current
        ) {
          isDrowsyAlertActiveRef.current = true;
          drowsy = true;
          speak('졸음이 감지되었습니다.');
          setTimeout(() => {
            isDrowsyAlertActiveRef.current = false;
            setAlerts(a => ({ ...a, drowsy: false }));
          }, 2000);
        }
      } else {
        drowsyCounterRef.current = 0;
        attentionLapseCounterRef.current = 0;
        headNodCounterRef.current = 0;
        absenceCounterRef.current++;
        const absenceFramesThreshold = ABSENCE_THRESHOLD_SECONDS * 30;
        if (
          absenceCounterRef.current >= absenceFramesThreshold &&
          !isAbsenceAlertActiveRef.current
        ) {
          isAbsenceAlertActiveRef.current = true;
          absence = true;
          speak('자리를 비우셨나요?');
          setTimeout(() => {
            isAbsenceAlertActiveRef.current = false;
            setAlerts(a => ({ ...a, absence: false }));
          }, 2000);
        }
      }
      setAlerts({ drowsy, absence, attention });
      requestAnimationFrame(predictWebcam);
    }
    predictWebcamRef.current = predictWebcam;
    loadAndStart();
    return () => {
      running = false;
      stopWebcam();
    };
  }, [earThreshold]);

  // 모달 닫힐 때 웹캠 스트림 해제
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  useEffect(() => {
    if (!minimized) {
      // 복원 시 video/canvas 크기 재설정 및 canvas 초기화
      if (videoRef.current && streamRef.current) {
        videoRef.current.width = 400;
        videoRef.current.height = 300;
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.onloadeddata = () => {
          if (predictWebcamRef.current) predictWebcamRef.current();
        };
      }
      if (canvasRef.current) {
        canvasRef.current.width = 400;
        canvasRef.current.height = 300;
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, 400, 300);
      }
    }
  }, [minimized]);

  if (minimized) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 16,
          right: 24,
          width: 200,
          height: 150,
          opacity: 1.0,
          pointerEvents: 'auto',
          zIndex: 10001,
          background: '#222',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="집중력 매니저 복원"
        onClick={() => setMinimized(false)}
      >
        <div style={{position: 'relative', width: 200, height: 150}}>
          <video
            ref={videoRef}
            width={200}
            height={150}
            autoPlay
            playsInline
            style={{
              borderRadius: 8,
              width: 200,
              height: 150,
              objectFit: 'cover',
              display: 'block',
              background: '#222'
            }}
          />
          <canvas
            ref={canvasRef}
            width={200}
            height={150}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              borderRadius: 8,
              width: 200,
              height: 150,
              pointerEvents: 'none',
              background: 'transparent'
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', zIndex: 10000, left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(44,62,80,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', background: '#2c3e50', color: 'white', borderRadius: 12, padding: 32, boxShadow: '0 8px 32px rgba(0,0,0,0.25)', minWidth: 400, maxWidth: 700 }}>
        <button onClick={() => { setMinimized(true); }} style={{ position: 'absolute', top: 16, right: 56, background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', zIndex: 11 }} title="최소화"><i className="fas fa-window-minimize"></i></button>
        <button onClick={() => { stopWebcam(); onClose(); }} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer', zIndex: 10 }}>&times;</button>
        <h2 style={{ marginBottom: 20, textAlign: 'center' }}>AI 집중력 매니저</h2>
        <div style={{ position: 'relative', border: '5px solid #3498db', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
          <video ref={videoRef} width={400} height={300} autoPlay playsInline style={{ display: 'block', transform: 'scaleX(-1)' }} />
          <canvas ref={canvasRef} width={400} height={300} style={{ position: 'absolute', left: 0, top: 0, transform: 'scaleX(-1)' }} />
          {alerts.drowsy && <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#e74c3c', color: 'white', padding: '10px 20px', borderRadius: 5, fontSize: '1.2em', fontWeight: 'bold', zIndex: 10 }}>졸음 감지!</div>}
          {alerts.absence && <div style={{ position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)', background: '#3498db', color: 'white', padding: '10px 20px', borderRadius: 5, fontSize: '1.2em', fontWeight: 'bold', zIndex: 10 }}>자리를 비우셨나요?</div>}
          {alerts.attention && <div style={{ position: 'absolute', top: 100, left: '50%', transform: 'translateX(-50%)', background: '#f39c12', color: 'white', padding: '10px 20px', borderRadius: 5, fontSize: '1.2em', fontWeight: 'bold', zIndex: 10 }}>집중하세요!</div>}
        </div>
        <div style={{ background: '#34495e', padding: 15, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 15, justifyContent: 'center' }}>
          <label htmlFor="ear-slider" style={{ fontWeight: 'bold' }}>졸음 민감도 (높을수록 민감)</label>
          <input
            type="range"
            id="ear-slider"
            min={0.15}
            max={0.35}
            step={0.01}
            value={earThreshold}
            onChange={e => { setEarThreshold(Number(e.target.value)); setEarValue(Number(e.target.value)); }}
          />
          <span style={{ fontFamily: 'monospace', fontSize: '1.2em', color: '#f1c40f', minWidth: 50, textAlign: 'center' }}>{earValue.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default WakeUpModal; 
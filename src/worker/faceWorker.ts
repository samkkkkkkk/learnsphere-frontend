// src/worker/faceWorker.ts
// Web Worker for face/eye analysis using MediaPipe (ESM module)

import visionModule from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs';

let faceLandmarker: any = null;
let initialized = false;

async function initModel() {
  const { FaceLandmarker, FilesetResolver } = visionModule;
  const filesetResolver = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`, delegate: "GPU" },
    runningMode: "VIDEO",
    numFaces: 1,
    outputFacialTransformationMatrixes: true,
  });
  initialized = true;
  self.postMessage({ type: 'ready' });
}

function getDistance(p1: any, p2: any) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function calculateEAR(eye: any[]) {
  const verticalDist = getDistance(eye[1], eye[5]) + getDistance(eye[2], eye[4]);
  const horizontalDist = getDistance(eye[0], eye[3]);
  return verticalDist / (2.0 * horizontalDist);
}

const EAR_THRESHOLD_DEFAULT = 0.23;
const DROWSY_CONSECUTIVE_FRAMES = 48;
const PITCH_THRESHOLD_DEGREES = 15;
const YAW_THRESHOLD_DEGREES = 20;
const ABSENCE_THRESHOLD_FRAMES = 90; // 3s at 30fps
const ATTENTION_LAPSE_FRAMES = 60; // 2s at 30fps

let drowsyCounter = 0, headNodCounter = 0, absenceCounter = 0, attentionLapseCounter = 0;
let EAR_THRESHOLD = EAR_THRESHOLD_DEFAULT;

self.onmessage = async (e: MessageEvent) => {
  if (e.data.type === 'init') {
    EAR_THRESHOLD = e.data.earThreshold || EAR_THRESHOLD_DEFAULT;
    await initModel();
    self.postMessage({ type: 'debug', msg: 'Model initialized' });
    return;
  }
  if (e.data.type === 'frame' && initialized && faceLandmarker) {
    const imageData = e.data.imageData;
    if (!imageData) return;
    createImageBitmap(imageData).then(imageBitmap => {
      self.postMessage({ type: 'debug', msg: `Received frame: ${imageBitmap.width}x${imageBitmap.height}` });
      // Try detectForVideo first
      let results = null;
      try {
        // @ts-ignore
        results = faceLandmarker.detectForVideo(imageBitmap, performance.now());
        self.postMessage({ type: 'debug', msg: `Detection result (detectForVideo): ${JSON.stringify(results)}` });
      } catch (err) {
        self.postMessage({ type: 'debug', msg: `detectForVideo error: ${err}` });
      }
      // If detectForVideo fails or returns no landmarks, try detect
      if (!results || !results.faceLandmarks || results.faceLandmarks.length === 0) {
        try {
          // @ts-ignore
          results = faceLandmarker.detect(imageBitmap);
          self.postMessage({ type: 'debug', msg: `Detection result (detect): ${JSON.stringify(results)}` });
        } catch (err) {
          self.postMessage({ type: 'debug', msg: `detect error: ${err}` });
        }
      }
      let status: string | null = null;
      let details: any = {};
      if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
        absenceCounter = 0;
        const landmarks = results.faceLandmarks[0];
        const leftEye = [362, 385, 387, 263, 373, 398].map(i => landmarks[i]);
        const rightEye = [33, 160, 158, 133, 153, 144].map(i => landmarks[i]);
        const avgEAR = (calculateEAR(leftEye) + calculateEAR(rightEye)) / 2.0;
        details.avgEAR = avgEAR;
        if (drowsyCounter % 10 === 0) self.postMessage({ type: 'debug', msg: `EAR: ${avgEAR.toFixed(3)}` });
        if (avgEAR < EAR_THRESHOLD) {
          drowsyCounter++;
        } else {
          drowsyCounter = 0;
        }
        if (results.facialTransformationMatrixes && results.facialTransformationMatrixes.length > 0) {
          const matrix = results.facialTransformationMatrixes[0].data;
          const yaw = Math.atan2(matrix[8], matrix[10]) * (180 / Math.PI);
          const pitch = Math.asin(-matrix[9]) * (180 / Math.PI);
          details.yaw = yaw;
          details.pitch = pitch;
          if (Math.abs(yaw) > YAW_THRESHOLD_DEGREES) {
            attentionLapseCounter++;
          } else {
            attentionLapseCounter = 0;
          }
          if (pitch > PITCH_THRESHOLD_DEGREES) {
            headNodCounter++;
          } else {
            headNodCounter = 0;
          }
          if (attentionLapseCounter > ATTENTION_LAPSE_FRAMES) {
            status = 'attention_lapse';
          }
        }
        if ((drowsyCounter >= DROWSY_CONSECUTIVE_FRAMES || headNodCounter >= DROWSY_CONSECUTIVE_FRAMES)) {
          status = 'drowsy';
          self.postMessage({ type: 'debug', msg: 'Drowsy detected!' });
        }
      } else {
        drowsyCounter = 0;
        attentionLapseCounter = 0;
        headNodCounter = 0;
        absenceCounter++;
        if (absenceCounter >= ABSENCE_THRESHOLD_FRAMES) {
          status = 'absence';
        }
      }
      self.postMessage({ type: 'result', status, details });
      imageBitmap.close && imageBitmap.close();
    });
  }
}; 
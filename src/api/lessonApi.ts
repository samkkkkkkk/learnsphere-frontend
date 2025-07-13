import axios from 'axios';

// FastAPI 서버의 기본 URL
const API_BASE_URL = 'http://127.0.0.1:8000';

// API 응답 타입 정의
export interface LessonContent {
  title: string;
  level: string;
  core_concepts: string;
  code_examples: Array<{
    description: string;
    code: string;
  }>;
  quizzes: Array<{
    question: string;
    answer: string;
  }>;
}

export interface LessonIndex {
  [level: string]: Array<{
    filename: string;
    title: string;
    number: number;
  }>;
}

// 생성된 레슨 목록(index.json)을 가져오는 API
export const fetchLessonIndex = async (): Promise<LessonIndex> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/lesson/index`);
    return response.data;
  } catch (error) {
    console.error('레슨 인덱스 조회 실패:', error);
    throw new Error('레슨 목록을 가져오는데 실패했습니다.');
  }
};

// 특정 레슨의 상세 내용(JSON)을 가져오는 API
export const fetchLessonDetail = async (filename: string): Promise<LessonContent> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/lesson/${filename}`);
    return response.data;
  } catch (error) {
    console.error('레슨 상세 조회 실패:', error);
    throw new Error('레슨 내용을 가져오는데 실패했습니다.');
  }
};

// [관리자용] 전체 콘텐츠 생성을 시작시키는 API
export const triggerFullContentGeneration = async (): Promise<{ message: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/v1/admin/generate-all-content`);
    return response.data;
  } catch (error) {
    console.error('콘텐츠 생성 요청 실패:', error);
    throw new Error('콘텐츠 생성 요청에 실패했습니다.');
  }
};

// PostgreSQL DB에서 주제별 콘텐츠 목록을 가져오는 API
export const fetchContentsBySubject = async (subjectName: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/contents/${subjectName}`);
    return response.data;
  } catch (error) {
    console.error('주제별 콘텐츠 조회 실패:', error);
    throw new Error('콘텐츠 목록을 가져오는데 실패했습니다.');
  }
};

// 서버 헬스 체크
export const checkServerHealth = async (): Promise<{ status: string }> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    return response.data;
  } catch (error) {
    console.error('서버 헬스 체크 실패:', error);
    throw new Error('서버 연결에 실패했습니다.');
  }
};
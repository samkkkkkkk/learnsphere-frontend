import api, { setAdminApiKey, getAdminApiKey } from './axios';

export { setAdminApiKey, getAdminApiKey };

// --- API 응답 타입 정의 ---

export interface CodeExample {
  description: string;
  code: string;
}

export interface Quiz {
  question: string;
  answer: string;
  explanation?: string;
}

export interface LessonSummary {
  id: number;
  title: string;
  number: number;
}

export interface LessonIndex {
  [level: string]: LessonSummary[];
}

export interface LessonDetail {
  id: number;
  level: string;
  title: string;
  core_concepts: string;
  code_examples: CodeExample[];
  quizzes: Quiz[];
  version_id: number;
  updated_at?: string;
}

export interface GenerationSummary {
  id: number;
  source: string;
  status: string;
  created_by?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  total_topics?: number | null;
  succeeded?: number | null;
  failed_count: number;
}

export interface GenerationDetail extends GenerationSummary {
  failed_topics: { level: string; topic: string; error: string }[];
}

export interface LessonVersionInfo {
  version_id: number;
  generation_id: number;
  title: string;
  created_at?: string | null;
  is_current: boolean;
  source?: string | null;
}

// --- 공개 레슨 조회 ---

// 레벨별 레슨 목록을 가져오는 API
export const fetchLessonIndex = async (): Promise<LessonIndex> => {
  try {
    const response = await api.get('/api/v1/lessons');
    return response.data;
  } catch (error) {
    console.error('레슨 목록 조회 실패:', error);
    throw new Error('레슨 목록을 가져오는데 실패했습니다.');
  }
};

// 특정 레슨의 상세 내용을 가져오는 API
export const fetchLessonDetail = async (lessonId: number): Promise<LessonDetail> => {
  try {
    const response = await api.get(`/api/v1/lessons/${lessonId}`);
    return response.data;
  } catch (error) {
    console.error('레슨 상세 조회 실패:', error);
    throw new Error('레슨 내용을 가져오는데 실패했습니다.');
  }
};

// PostgreSQL DB에서 주제별 콘텐츠 목록을 가져오는 API
export const fetchContentsBySubject = async (subjectName: string) => {
  try {
    const response = await api.get(`/api/v1/contents/${subjectName}`);
    return response.data;
  } catch (error) {
    console.error('주제별 콘텐츠 조회 실패:', error);
    throw new Error('콘텐츠 목록을 가져오는데 실패했습니다.');
  }
};

// 서버 헬스 체크
export const checkServerHealth = async (): Promise<{ status: string }> => {
  try {
    const response = await api.get('/api/health');
    return response.data;
  } catch (error) {
    console.error('서버 헬스 체크 실패:', error);
    throw new Error('서버 연결에 실패했습니다.');
  }
};

// --- 관리자 API (X-Admin-API-Key 헤더는 axios 인터셉터가 자동 첨부) ---

// [관리자용] 전체 콘텐츠 생성을 시작시키는 API
export const triggerFullContentGeneration = async (): Promise<{ message: string; generation_id: number }> => {
  try {
    const response = await api.post('/api/v1/admin/generate-all-content');
    return response.data;
  } catch (error) {
    console.error('콘텐츠 생성 요청 실패:', error);
    throw new Error('콘텐츠 생성 요청에 실패했습니다.');
  }
};

// 생성 세대 목록 조회
export const fetchGenerations = async (): Promise<GenerationSummary[]> => {
  const response = await api.get('/api/v1/admin/generations');
  return response.data;
};

// 생성 세대 상세 조회 (실패 토픽 포함)
export const fetchGenerationDetail = async (generationId: number): Promise<GenerationDetail> => {
  const response = await api.get(`/api/v1/admin/generations/${generationId}`);
  return response.data;
};

// 특정 세대의 레슨으로 일괄 전환
export const activateGeneration = async (generationId: number): Promise<{ message: string }> => {
  const response = await api.post(`/api/v1/admin/generations/${generationId}/activate`);
  return response.data;
};

// 특정 레슨의 버전 목록 조회
export const fetchLessonVersions = async (lessonId: number): Promise<LessonVersionInfo[]> => {
  const response = await api.get(`/api/v1/admin/lessons/${lessonId}/versions`);
  return response.data;
};

// 특정 버전으로 레슨 복원
export const restoreLessonVersion = async (
  lessonId: number,
  versionId: number,
  restoredBy?: string,
): Promise<{ message: string }> => {
  const response = await api.post(`/api/v1/admin/lessons/${lessonId}/restore`, {
    version_id: versionId,
    restored_by: restoredBy,
  });
  return response.data;
};

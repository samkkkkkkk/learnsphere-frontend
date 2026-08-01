import json
import os
from typing import Dict, List, Optional
from config import get_subject_paths, EXAMPLES_DIR

class CurriculumManager:
    """커리큘럼 로딩 및 관리 클래스"""
    
    def __init__(self, subject_name: str):
        self.subject_name = subject_name
        self.paths = get_subject_paths(subject_name)
        self._curriculum_data = None
    
    def load_curriculum(self) -> Dict:
        """커리큘럼 JSON 파일 로드"""
        if self._curriculum_data is not None:
            return self._curriculum_data
            
        curriculum_file = self.paths["curriculum_file"]
        
        if not os.path.exists(curriculum_file):
            raise FileNotFoundError(f"커리큘럼 파일이 존재하지 않습니다: {curriculum_file}")
        
        try:
            with open(curriculum_file, 'r', encoding='utf-8') as f:
                self._curriculum_data = json.load(f)
            return self._curriculum_data
        except json.JSONDecodeError as e:
            raise ValueError(f"커리큘럼 JSON 파일 파싱 오류: {e}")
    
    def get_lecture_series(self) -> List[Dict]:
        """강의 시리즈 목록 반환"""
        curriculum = self.load_curriculum()
        return curriculum.get("lectures", [])
    
    def get_lecture_info(self, lecture_number: int) -> Optional[Dict]:
        """특정 강의 정보 반환"""
        lectures = self.get_lecture_series()
        for lecture in lectures:
            if lecture.get("number") == lecture_number:
                return lecture
        return None
    
    def get_total_lectures(self) -> int:
        """전체 강의 수 반환"""
        return len(self.get_lecture_series())
    
    def get_subject_info(self) -> Dict:
        """주제 정보 반환"""
        curriculum = self.load_curriculum()
        return curriculum.get("subject", {})
    
    def get_quality_template_path(self) -> str:
        """품질 기준 템플릿 파일 경로 반환"""
        subject_info = self.get_subject_info()
        template_filename = subject_info.get("quality_template", f"{self.subject_name}_lecture_example.md")
        return os.path.join(EXAMPLES_DIR, template_filename)
    
    def validate_curriculum(self) -> List[str]:
        """커리큘럼 유효성 검사 및 문제점 반환"""
        issues = []
        
        try:
            curriculum = self.load_curriculum()
        except Exception as e:
            return [f"커리큘럼 로드 실패: {e}"]
        
        # 필수 필드 확인
        if "subject" not in curriculum:
            issues.append("'subject' 필드가 없습니다.")
        
        if "lectures" not in curriculum:
            issues.append("'lectures' 필드가 없습니다.")
            return issues
        
        lectures = curriculum["lectures"]
        if not lectures:
            issues.append("강의 목록이 비어있습니다.")
            return issues
        
        # 강의 번호 연속성 확인
        lecture_numbers = [lecture.get("number") for lecture in lectures]
        expected_numbers = list(range(1, len(lectures) + 1))
        
        if lecture_numbers != expected_numbers:
            issues.append(f"강의 번호가 연속적이지 않습니다. 예상: {expected_numbers}, 실제: {lecture_numbers}")
        
        # 각 강의 필수 필드 확인
        required_fields = ["number", "title", "description", "filename"]
        for i, lecture in enumerate(lectures):
            for field in required_fields:
                if field not in lecture:
                    issues.append(f"강의 {i+1}에 '{field}' 필드가 없습니다.")
        
        # 품질 템플릿 파일 존재 확인
        template_path = self.get_quality_template_path()
        if not os.path.exists(template_path):
            issues.append(f"품질 템플릿 파일이 존재하지 않습니다: {template_path}")
        
        return issues
    
    def create_default_curriculum(self) -> Dict:
        """기본 커리큘럼 구조 생성 (UniTask 기준)"""
        if self.subject_name == "unitask":
            return self._create_unitask_curriculum()
        else:
            return self._create_generic_curriculum()
    
    def _create_unitask_curriculum(self) -> Dict:
        """UniTask 12강 커리큘럼 생성"""
        return {
            "subject": {
                "name": "UniTask",
                "description": "Unity 전용 고성능 비동기 프로그래밍 라이브러리",
                "quality_template": "unitask_lecture_example.md",
                "total_lectures": 12
            },
            "lectures": [
                {
                    "number": 1,
                    "title": "UniTask 첫걸음",
                    "description": "UniTask vs Coroutine, 기본 async/await, AsyncOperation",
                    "filename": "lecture_01_first_steps.md",
                    "status": "example_exists"
                },
                {
                    "number": 2,
                    "title": "시간과 프레임 제어",
                    "description": "UniTask.Delay, DelayFrame, Yield, NextFrame, ignoreTimeScale",
                    "filename": "lecture_02_time_frame_control.md"
                },
                {
                    "number": 3,
                    "title": "Unity AsyncOperation 완전 정복",
                    "description": "SceneManager, Resources, UnityWebRequest, Addressables 비동기 처리",
                    "filename": "lecture_03_asyncoperation_mastery.md"
                },
                {
                    "number": 4,
                    "title": "취소 시스템 마스터하기",
                    "description": "CancellationToken 심화, GetCancellationTokenOnDestroy, CancelAfterSlim",
                    "filename": "lecture_04_cancellation_system.md"
                },
                {
                    "number": 5,
                    "title": "예외 처리와 안전한 코딩",
                    "description": "try-catch 패턴, OperationCanceledException, Result<T> 패턴",
                    "filename": "lecture_05_exception_handling.md"
                },
                {
                    "number": 6,
                    "title": "진행 상황과 피드백",
                    "description": "IProgress<T>, Progress.Create, 로딩바 실무 패턴",
                    "filename": "lecture_06_progress_feedback.md"
                },
                {
                    "number": 7,
                    "title": "병렬 처리의 기술",
                    "description": "WhenAll, WhenAny, 복합 작업 조합, 조건부 병렬 처리",
                    "filename": "lecture_07_parallel_processing.md"
                },
                {
                    "number": 8,
                    "title": "커스텀 비동기 작업",
                    "description": "UniTaskCompletionSource 활용, 콜백을 async/await로 변환",
                    "filename": "lecture_08_custom_async_tasks.md"
                },
                {
                    "number": 9,
                    "title": "async void vs UniTaskVoid",
                    "description": "fire-and-forget 패턴, UniTask.Action, MonoBehaviour 생명주기 연동",
                    "filename": "lecture_09_async_void_patterns.md"
                },
                {
                    "number": 10,
                    "title": "AsyncEnumerable과 스트림",
                    "description": "IUniTaskAsyncEnumerable, Async LINQ, 실시간 데이터 스트림 처리",
                    "filename": "lecture_10_async_enumerable.md"
                },
                {
                    "number": 11,
                    "title": "Unity 이벤트와 UI 연동",
                    "description": "Awaitable Events, AsyncTriggers, Button 클릭 비동기 처리",
                    "filename": "lecture_11_unity_events_ui.md"
                },
                {
                    "number": 12,
                    "title": "디버깅과 성능 최적화",
                    "description": "UniTaskTracker 활용법, 메모리 누수 방지, 성능 프로파일링",
                    "filename": "lecture_12_debugging_optimization.md"
                }
            ]
        }
    
    def _create_generic_curriculum(self) -> Dict:
        """범용 커리큘럼 템플릿 생성"""
        return {
            "subject": {
                "name": self.subject_name.title(),
                "description": f"{self.subject_name} 강의 시리즈",
                "quality_template": f"{self.subject_name}_lecture_example.md",
                "total_lectures": 1
            },
            "lectures": [
                {
                    "number": 1,
                    "title": f"{self.subject_name.title()} 기초",
                    "description": f"{self.subject_name} 기본 개념 및 사용법",
                    "filename": f"lecture_01_{self.subject_name}_basics.md"
                }
            ]
        }
    
    def save_curriculum(self, curriculum_data: Dict) -> None:
        """커리큘럼을 JSON 파일로 저장"""
        curriculum_file = self.paths["curriculum_file"]
        
        # 디렉토리 생성
        os.makedirs(os.path.dirname(curriculum_file), exist_ok=True)
        
        try:
            with open(curriculum_file, 'w', encoding='utf-8') as f:
                json.dump(curriculum_data, f, ensure_ascii=False, indent=2)
            print(f"✅ 커리큘럼 저장 완료: {curriculum_file}")
        except Exception as e:
            raise ValueError(f"커리큘럼 저장 실패: {e}")

def create_curriculum_if_not_exists(subject_name: str) -> CurriculumManager:
    """커리큘럼이 없으면 기본 커리큘럼 생성"""
    manager = CurriculumManager(subject_name)
    
    if not os.path.exists(manager.paths["curriculum_file"]):
        print(f"📝 {subject_name} 커리큘럼이 없습니다. 기본 커리큘럼을 생성합니다.")
        default_curriculum = manager.create_default_curriculum()
        manager.save_curriculum(default_curriculum)
    
    return manager
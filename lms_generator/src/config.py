import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 기본 디렉토리 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.join(BASE_DIR, '..')
SUBJECTS_DIR = os.path.join(PROJECT_ROOT, 'subjects')
EXAMPLES_DIR = os.path.join(PROJECT_ROOT, 'examples')

# 환경 변수
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")

# RAG 설정
RAG_CONFIG = {
    "chunk_size": 1500,
    "chunk_overlap": 200,
    "embedding_model": "text-embedding-3-small",
    "vector_dimension": 1536,
    "top_k_results": 5
}

# OpenAI 생성 설정
GENERATION_CONFIG = {
    "model": "gpt-4o",
    "temperature": 0.7,
    "max_tokens": 4000
}

def get_subject_paths(subject_name):
    """주제별 경로 반환"""
    subject_dir = os.path.join(SUBJECTS_DIR, subject_name)
    return {
        "subject_dir": subject_dir,
        "data_dir": os.path.join(subject_dir, "data"),
        "generated_dir": os.path.join(subject_dir, "generated", "courses"),
        "curriculum_file": os.path.join(subject_dir, "curriculum.json")
    }

def get_qdrant_collection_name(subject_name):
    """주제별 Qdrant 컬렉션명 반환"""
    return f"{subject_name}_lms"

def ensure_subject_directories(subject_name):
    """주제별 필요한 디렉토리들이 존재하는지 확인하고 생성"""
    paths = get_subject_paths(subject_name)
    
    directories = [
        paths["subject_dir"],
        paths["data_dir"],
        paths["generated_dir"]
    ]
    
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
    
    return paths

def validate_config(subject_name=None):
    """설정 유효성 검사"""
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY가 설정되지 않았습니다.")
    
    print("✅ 기본 설정 검증 완료")
    print(f"🔗 Qdrant URL: {QDRANT_URL}")
    print(f"📁 Subjects Directory: {SUBJECTS_DIR}")
    
    if subject_name:
        paths = get_subject_paths(subject_name)
        print(f"\n📚 {subject_name.upper()} 설정:")
        print(f"📁 Subject Directory: {paths['subject_dir']}")
        print(f"📁 Data Directory: {paths['data_dir']}")
        print(f"📁 Generated Directory: {paths['generated_dir']}")
        print(f"📦 Collection Name: {get_qdrant_collection_name(subject_name)}")
        
        if not os.path.exists(paths["subject_dir"]):
            print(f"⚠️  경고: {subject_name} 폴더가 존재하지 않습니다.")
            
        if not os.path.exists(paths["curriculum_file"]):
            print(f"⚠️  경고: {subject_name} curriculum.json이 존재하지 않습니다.")
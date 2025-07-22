"""
LMS 강의 시리즈 배치 생성 시스템

전체 커리큘럼을 순차적으로 생성하는 메인 실행 파일
Rate Limit, 에러 처리, 진행률 표시 포함
"""

import os
import time
import argparse
import sys
from datetime import datetime
from typing import List, Dict, Optional

from config import ensure_subject_directories, validate_config
from curriculum_manager import CurriculumManager
from lecture_generator import LectureGenerator

class LMSBatchGenerator:
    """LMS 강의 시리즈 배치 생성 클래스"""
    
    def __init__(self, subject: str):
        self.subject = subject
        self.curriculum_manager = CurriculumManager(subject)
        self.lecture_generator = LectureGenerator(subject)
        
        # 배치 설정
        self.rate_limit_delay = 10  # API 호출 사이 대기시간 (초)
        self.max_retries = 3       # 실패 시 최대 재시도 횟수
        
    def validate_prerequisites(self) -> bool:
        """생성 전 필수 조건 검증"""
        print("🔍 시스템 요구사항 검증 중...")
        
        try:
            # 1. 기본 설정 검증
            validate_config(self.subject)
            
            # 2. 디렉토리 확인/생성
            ensure_subject_directories(self.subject)
            
            # 3. 커리큘럼 검증
            issues = self.curriculum_manager.validate_curriculum()
            if issues:
                print("❌ 커리큘럼 검증 실패:")
                for issue in issues:
                    print(f"   - {issue}")
                return False
            
            print("✅ 모든 요구사항 검증 완료")
            return True
            
        except Exception as e:
            print(f"❌ 요구사항 검증 실패: {e}")
            return False
    
    def get_generation_plan(self, start_lecture: int = 1, end_lecture: Optional[int] = None) -> List[Dict]:
        """생성 계획 수립"""
        all_lectures = self.curriculum_manager.get_lecture_series()
        
        if end_lecture is None:
            end_lecture = len(all_lectures)
        
        # 생성할 강의 필터링
        target_lectures = [
            lec for lec in all_lectures 
            if start_lecture <= lec['number'] <= end_lecture
        ]
        
        print(f"📋 생성 계획: {len(target_lectures)}개 강의 ({start_lecture}강~{end_lecture}강)")
        
        return target_lectures
    
    def generate_single_lecture(self, lecture_number: int, retry_count: int = 0) -> bool:
        """개별 강의 생성 (재시도 로직 포함)"""
        try:
            print(f"\n⏳ {lecture_number}강 생성 시도 {retry_count + 1}/{self.max_retries}")
            
            # 강의 생성
            filepath = self.lecture_generator.generate_and_save_lecture(lecture_number)
            
            # 생성 결과 검증
            if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:  # 1KB 이상
                print(f"✅ {lecture_number}강 생성 성공: {os.path.basename(filepath)}")
                return True
            else:
                raise Exception(f"생성된 파일이 비어있거나 너무 작습니다: {filepath}")
                
        except Exception as e:
            print(f"❌ {lecture_number}강 생성 실패 (시도 {retry_count + 1}): {e}")
            
            if retry_count < self.max_retries - 1:
                wait_time = (retry_count + 1) * 5  # 재시도마다 대기시간 증가
                print(f"⏱️  {wait_time}초 후 재시도...")
                time.sleep(wait_time)
                return self.generate_single_lecture(lecture_number, retry_count + 1)
            else:
                print(f"💥 {lecture_number}강 생성 최종 실패 (최대 재시도 횟수 초과)")
                return False
    
    def generate_lecture_series(self, start_lecture: int = 1, end_lecture: Optional[int] = None, 
                               skip_existing: bool = True) -> Dict[str, List[int]]:
        """전체 강의 시리즈 생성"""
        
        # 전처리 검증
        if not self.validate_prerequisites():
            return {"failed": [-1], "success": [], "skipped": []}
        
        # 생성 계획 수립
        target_lectures = self.get_generation_plan(start_lecture, end_lecture)
        
        if not target_lectures:
            print("❌ 생성할 강의가 없습니다.")
            return {"failed": [], "success": [], "skipped": []}
        
        # 배치 생성 시작
        print("=" * 70)
        print(f"🚀 {self.subject.upper()} 강의 시리즈 배치 생성 시작")
        print(f"📅 시작 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 70)
        
        results = {"success": [], "failed": [], "skipped": []}
        
        for i, lecture_info in enumerate(target_lectures, 1):
            lecture_number = lecture_info['number']
            
            # 진행률 표시
            progress = f"[{i}/{len(target_lectures)}]"
            print(f"\n{progress} 📝 {lecture_number}강: {lecture_info['title']}")
            
            # 기존 파일 존재 여부 확인
            expected_filename = lecture_info.get('filename', f"lecture_{lecture_number:02d}.md")
            filepath = os.path.join(
                self.curriculum_manager.paths["generated_dir"], 
                expected_filename.replace('.md', '') + '.md'
            )
            
            if skip_existing and os.path.exists(filepath):
                print(f"⏭️  기존 파일 존재, 건너뜀: {os.path.basename(filepath)}")
                results["skipped"].append(lecture_number)
                continue
            
            # 강의 생성
            success = self.generate_single_lecture(lecture_number)
            
            if success:
                results["success"].append(lecture_number)
            else:
                results["failed"].append(lecture_number)
                
                # 치명적 실패 시 사용자에게 확인
                if len(results["failed"]) >= 3:
                    response = input(f"\n⚠️  연속 {len(results['failed'])}개 강의 생성 실패. 계속하시겠습니까? (y/N): ")
                    if response.lower() not in ['y', 'yes']:
                        print("🛑 사용자 요청으로 배치 생성 중단")
                        break
            
            # Rate Limit 대기 (마지막 강의가 아닌 경우)
            if i < len(target_lectures):
                print(f"⏱️  API Rate Limit 대기: {self.rate_limit_delay}초...")
                time.sleep(self.rate_limit_delay)
        
        # 최종 결과 리포트
        self.print_final_report(results, target_lectures)
        
        return results
    
    def print_final_report(self, results: Dict[str, List[int]], target_lectures: List[Dict]):
        """최종 결과 리포트 출력"""
        total = len(target_lectures)
        success_count = len(results["success"])
        failed_count = len(results["failed"])
        skipped_count = len(results["skipped"])
        
        print("\n" + "=" * 70)
        print("📊 배치 생성 최종 결과")
        print("=" * 70)
        print(f"📈 전체: {total}개")
        print(f"✅ 성공: {success_count}개 {results['success'] if success_count <= 5 else results['success'][:5] + ['...']}")
        print(f"❌ 실패: {failed_count}개 {results['failed'] if failed_count <= 5 else results['failed'][:5] + ['...']}")
        print(f"⏭️  건너뜀: {skipped_count}개 {results['skipped'] if skipped_count <= 5 else results['skipped'][:5] + ['...']}")
        print(f"📅 완료 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # 성공률 계산
        if total > skipped_count:
            success_rate = (success_count / (total - skipped_count)) * 100
            print(f"🎯 성공률: {success_rate:.1f}%")
        
        # 권장사항
        if failed_count > 0:
            print(f"\n💡 실패한 강의들은 개별적으로 재생성해보세요:")
            for lecture_num in results["failed"]:
                print(f"   python src/lecture_generator.py --subject {self.subject} --lecture {lecture_num}")
        
        print("=" * 70)

def main():
    """메인 실행 함수"""
    parser = argparse.ArgumentParser(description="LMS 강의 시리즈 배치 생성")
    parser.add_argument("--subject", required=True, help="주제명 (예: unitask)")
    parser.add_argument("--start", type=int, default=1, help="시작 강의 번호 (기본: 1)")
    parser.add_argument("--end", type=int, help="마지막 강의 번호 (기본: 전체)")
    parser.add_argument("--overwrite", action="store_true", help="기존 파일 덮어쓰기 (기본: 건너뜀)")
    parser.add_argument("--delay", type=int, default=10, help="API 호출 사이 대기시간(초) (기본: 10)")
    
    args = parser.parse_args()
    
    try:
        # 배치 생성기 초기화
        generator = LMSBatchGenerator(args.subject)
        generator.rate_limit_delay = args.delay
        
        # 배치 생성 실행
        results = generator.generate_lecture_series(
            start_lecture=args.start,
            end_lecture=args.end,
            skip_existing=not args.overwrite
        )
        
        # 종료 코드 설정
        if results["failed"]:
            sys.exit(1)  # 실패한 강의가 있으면 에러 코드
        else:
            sys.exit(0)  # 모든 강의 성공
            
    except KeyboardInterrupt:
        print("\n🛑 사용자 중단 (Ctrl+C)")
        sys.exit(130)
    except Exception as e:
        print(f"\n💥 예상치 못한 오류: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
# 2026-04-13 — P2: 백엔드 pytest 환경 구성

## BACKLOG 항목
- [P2] 백엔드 유닛 테스트 환경 구성 (pytest)

## 접근
1. pytest, pytest-asyncio 설치 (httpx는 이미 requirements.txt에 있음)
2. server/pytest.ini 생성 (testpaths=tests, pythonpath=..)
3. server/tests/ 디렉터리 + __init__.py 생성
4. schemas.py의 Pydantic 모델에 대한 유닛 테스트 8개 작성
   - LanguageCode 유효/무효 검증
   - CreateDubbingRequest 필수 필드 검증
   - DubbingItem, DubbingProgress 모델 검증
   - UserProfile optional 필드 검증

## 변경 파일
- `server/pytest.ini` — 신규 생성
- `server/tests/__init__.py` — 신규 생성
- `server/tests/test_schemas.py` — 유닛 테스트 8개

## 테스트 결과
- `python -m pytest tests/test_schemas.py -v` — 8/8 pass
- `npx tsc --noEmit` — 성공

## 다음 루프 주의사항
- P2 전체 완료. 자가 생성 풀에서 다음 항목을 뽑아야 함.
- server/.env 없이는 서버 기능 테스트 불가 → 순수 모델 테스트만 작성함

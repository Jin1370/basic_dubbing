---
name: dubbing-backend
description: "모바일 더빙 앱의 FastAPI 백엔드 구현 스킬. API 엔드포인트 구현, Perso AI API 연동, Supabase DB/Storage 관리, 인증 미들웨어를 수행한다. '백엔드 구현', 'API 만들기', 'FastAPI', '서버 구현', '백엔드 코딩' 등 백엔드 관련 작업 요청 시 이 스킬을 사용할 것."
---

# 모바일 더빙 앱 백엔드 스킬

## 기술 스택

- **FastAPI** (Python 3.11+)
- **Pydantic v2** — 요청/응답 스키마
- **Supabase Python** — DB/Storage/Auth 연동
- **httpx** — Perso AI API 비동기 호출
- **python-dotenv** — 환경변수 관리

## 프로젝트 구조

```
server/
├── main.py                # FastAPI 앱 진입점
├── routers/
│   ├── auth.py            # 인증 관련 엔드포인트
│   ├── dubbing.py         # 더빙 작업 CRUD
│   └── videos.py          # 영상 업로드/다운로드
├── services/
│   ├── perso_ai.py        # Perso AI API 클라이언트
│   ├── supabase_client.py # Supabase 연결
│   └── dubbing_service.py # 더빙 비즈니스 로직
├── models/
│   ├── schemas.py         # Pydantic 요청/응답 모델
│   └── database.py        # DB 테이블 스키마
├── middleware/
│   └── auth.py            # JWT 검증 미들웨어
├── requirements.txt
└── .env.example
```

## API 엔드포인트 설계

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| POST | `/api/auth/google` | Google 로그인 처리 | X |
| GET | `/api/dubbing` | 더빙 이력 목록 | O |
| POST | `/api/dubbing` | 새 더빙 작업 생성 | O |
| GET | `/api/dubbing/{id}` | 더빙 작업 상세 | O |
| GET | `/api/dubbing/{id}/status` | 더빙 진행 상태 | O |
| POST | `/api/videos/upload` | 영상 업로드 (Supabase Storage) | O |
| GET | `/api/videos/{id}/download` | 더빙된 영상 다운로드 URL | O |

## 구현 원칙

1. **API 키 보호**: Perso AI API 키, Supabase 키는 `.env`로만 관리. `.env.example`에 키 이름만 기록.
2. **비동기 더빙 처리**: 더빙 작업 생성(POST) → 즉시 작업 ID 반환(202) → 상태 폴링(GET status) → 완료 시 결과 URL 반환.
3. **Pydantic 스키마**: 모든 엔드포인트에 요청/응답 모델을 정의한다. 프론트엔드 API 계약과 일치시킨다.
4. **에러 응답 표준화**: `{"detail": "에러 메시지", "code": "ERROR_CODE"}` 형식으로 통일.
5. **Supabase Storage**: 원본 영상은 `videos/original/{user_id}/`, 더빙 영상은 `videos/dubbed/{user_id}/`에 저장.

## 산출물

- `server/` — FastAPI 서버 소스코드
- `_workspace/03_backend_api_spec.md` — 구현된 API 스펙 문서

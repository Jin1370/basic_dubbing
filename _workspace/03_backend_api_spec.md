# 백엔드 API 스펙 문서

구현된 모든 API 엔드포인트, Pydantic 모델, 에러 코드를 정리한다.

---

## 공통 사항

- **Base URL**: `{HOST}:{PORT}/api`
- **인증**: `Authorization: Bearer {supabase_jwt}` (POST /api/auth/google 제외)
- **에러 응답 형식**:
  ```json
  {
    "detail": "에러 메시지",
    "code": "ERROR_CODE"
  }
  ```

---

## 엔드포인트 목록

| Method | Path | 설명 | 인증 | 상태코드 |
|--------|------|------|------|---------|
| GET | `/health` | 헬스 체크 | X | 200 |
| POST | `/api/auth/google` | Google 로그인 | X | 200 |
| GET | `/api/users/me` | 현재 사용자 프로필 | O | 200 |
| POST | `/api/upload` | 영상 업로드 | O | 201 |
| GET | `/api/dubbing` | 더빙 이력 목록 | O | 200 |
| POST | `/api/dubbing` | 더빙 작업 생성 | O | 201 |
| GET | `/api/dubbing/{id}` | 더빙 작업 상세 | O | 200 |
| GET | `/api/dubbing/{id}/status` | 더빙 진행 상태 | O | 200 |
| GET | `/api/dubbing/{id}/download` | 더빙 영상 다운로드 URL | O | 200 |

---

## 1. POST /api/auth/google

Google ID 토큰으로 Supabase Auth 로그인을 수행한다.

**요청**:
```json
{
  "id_token": "google-id-token-string"
}
```

**응답 200**:
```json
{
  "access_token": "supabase-jwt",
  "refresh_token": "refresh-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "홍길동",
    "avatar_url": "https://..." 
  }
}
```

---

## 2. GET /api/users/me

현재 로그인한 사용자 프로필을 반환한다.

**응답 200**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "display_name": "홍길동",
  "avatar_url": "https://..."
}
```

---

## 3. POST /api/upload

영상 파일을 Supabase Storage에 업로드한다.

**요청**: `multipart/form-data`
| 필드 | 타입 | 설명 |
|------|------|------|
| file | File | 영상 파일 (MP4, MOV, 최대 500MB) |

**응답 201**:
```json
{
  "video_uri": "storage://videos/original/{user_id}/abcdef.mp4"
}
```

**에러**:
- `400`: 지원하지 않는 파일 형식
- `413`: 파일 크기 초과 (500MB)

---

## 4. GET /api/dubbing

로그인 사용자의 더빙 이력 목록을 최신순으로 반환한다.

**응답 200**:
```json
[
  {
    "id": "uuid",
    "title": "파일명.mp4",
    "thumbnail_url": null,
    "source_language": "ko",
    "target_language": "en",
    "status": "completed",
    "created_at": "2026-04-13T14:30:00Z",
    "file_size_bytes": 15200000,
    "duration_seconds": 90
  }
]
```

---

## 5. POST /api/dubbing

새 더빙 작업을 생성한다. 즉시 작업 ID를 반환하고 백그라운드에서 처리한다.

**요청**:
```json
{
  "video_uri": "storage://videos/original/{user_id}/abcdef.mp4",
  "file_name": "파일명.mp4",
  "source_language": "ko",
  "target_language": "en"
}
```

**응답 201**:
```json
{
  "id": "uuid",
  "status": "processing"
}
```

**에러**:
- `400`: 원본 언어와 대상 언어가 동일

---

## 6. GET /api/dubbing/{id}

더빙 작업의 상세 정보를 반환한다.

**응답 200**:
```json
{
  "id": "uuid",
  "title": "파일명.mp4",
  "thumbnail_url": null,
  "source_language": "ko",
  "target_language": "en",
  "status": "completed",
  "created_at": "2026-04-13T14:30:00Z",
  "file_size_bytes": 15200000,
  "duration_seconds": 90,
  "original_video_url": "https://...",
  "dubbed_video_url": "https://...",
  "completed_at": "2026-04-13T14:35:00Z"
}
```

**에러**:
- `404`: 작업을 찾을 수 없음

---

## 7. GET /api/dubbing/{id}/status

더빙 진행 상태를 반환한다. 프론트에서 3초 간격으로 폴링.

**응답 200**:
```json
{
  "id": "uuid",
  "status": "processing",
  "current_step": "analyze_speech",
  "progress_percent": 65,
  "estimated_remaining_seconds": 150,
  "steps": [
    { "step": "upload", "status": "done" },
    { "step": "extract_audio", "status": "done" },
    { "step": "analyze_speech", "status": "in_progress" },
    { "step": "synthesize_dubbing", "status": "pending" }
  ]
}
```

**에러**:
- `404`: 작업을 찾을 수 없음

---

## 8. GET /api/dubbing/{id}/download

더빙 완료된 영상의 다운로드 URL을 반환한다.

**응답 200**:
```json
{
  "url": "https://...presigned-download-url..."
}
```

**에러**:
- `404`: 아직 더빙이 완료되지 않았거나 작업을 찾을 수 없음

---

## Pydantic 모델 정의

### Enums

| 이름 | 값 |
|------|-----|
| `LanguageCode` | `ko`, `en`, `ja`, `zh`, `es` |
| `DubbingStatus` | `uploading`, `processing`, `completed`, `failed` |
| `DubbingStep` | `upload`, `extract_audio`, `analyze_speech`, `synthesize_dubbing` |
| `StepStatus` | `done`, `in_progress`, `pending` |

### 모델 필드 매핑 (TypeScript <-> Pydantic)

| TypeScript (lib/types.ts) | Pydantic (schemas.py) | 일치 여부 |
|---------------------------|----------------------|----------|
| `UserProfile` | `UserProfile` | O |
| `DubbingItem` | `DubbingItem` | O |
| `DubbingDetail` | `DubbingDetail` | O |
| `DubbingProgress` | `DubbingProgress` | O |
| `CreateDubbingRequest` | `CreateDubbingRequest` | O |
| `CreateDubbingResponse` | `CreateDubbingResponse` | O |
| `ApiError` | `ErrorResponse` | O |

---

## 에러 코드

| HTTP | code | 설명 |
|------|------|------|
| 400 | - | 잘못된 요청 (형식 오류, 동일 언어 등) |
| 401 | - | 인증 실패/만료 |
| 404 | - | 리소스 없음 |
| 413 | - | 파일 크기 초과 (500MB) |
| 500 | `INTERNAL_SERVER_ERROR` | 서버 내부 오류 |

---

## 환경변수

| 변수 | 설명 |
|------|------|
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_ANON_KEY` | Supabase 익명 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 역할 키 |
| `SUPABASE_JWT_SECRET` | Supabase JWT 시크릿 |
| `PERSO_AI_API_URL` | Perso AI API URL |
| `PERSO_AI_API_KEY` | Perso AI API 키 |
| `HOST` | 서버 호스트 (기본: 0.0.0.0) |
| `PORT` | 서버 포트 (기본: 8000) |
| `DEBUG` | 디버그 모드 (기본: false) |
| `CORS_ORIGINS` | CORS 허용 오리진 JSON 배열 |

---

## DB 테이블

### dubbing_jobs
- `id` UUID PK
- `user_id` UUID FK(auth.users)
- `title` TEXT
- `thumbnail_url` TEXT (nullable)
- `source_language` TEXT
- `target_language` TEXT
- `status` TEXT (uploading/processing/completed/failed)
- `current_step` TEXT (upload/extract_audio/analyze_speech/synthesize_dubbing)
- `progress_percent` INT
- `estimated_remaining_seconds` INT (nullable)
- `video_uri` TEXT
- `original_video_url` TEXT
- `dubbed_video_url` TEXT (nullable)
- `file_size_bytes` BIGINT
- `duration_seconds` INT
- `perso_ai_job_id` TEXT (nullable)
- `created_at` TIMESTAMPTZ
- `completed_at` TIMESTAMPTZ (nullable)
- `updated_at` TIMESTAMPTZ

### user_profiles
- `id` UUID PK FK(auth.users)
- `email` TEXT
- `display_name` TEXT
- `avatar_url` TEXT (nullable)
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

---

## Storage 경로

| 용도 | 경로 |
|------|------|
| 원본 영상 | `videos/original/{user_id}/{filename}` |
| 더빙 영상 | `videos/dubbed/{user_id}/{filename}` |

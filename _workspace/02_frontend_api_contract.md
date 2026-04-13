# 프론트엔드 API 계약서

프론트엔드에서 기대하는 백엔드 API 엔드포인트, 요청/응답 형식을 정의한다.

---

## 공통 사항

- **Base URL**: `{API_BASE_URL}/api`
- **인증**: 모든 요청에 `Authorization: Bearer {supabase_jwt}` 헤더 첨부
- **에러 응답 형식**:
  ```json
  {
    "detail": "에러 메시지",
    "code": "ERROR_CODE"  // optional
  }
  ```
- **HTTP 상태 코드**:
  - `200` 성공
  - `201` 생성 성공
  - `400` 잘못된 요청
  - `401` 인증 실패/만료
  - `404` 리소스 없음
  - `413` 파일 크기 초과
  - `500` 서버 오류

---

## 1. 사용자

### GET /api/users/me

현재 로그인한 사용자 프로필을 반환한다.

**응답 `200`**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "display_name": "홍길동",
  "avatar_url": "https://..." // nullable
}
```

---

## 2. 영상 업로드

### POST /api/upload

영상 파일을 업로드하고 storage URI를 반환한다.

**요청**: `multipart/form-data`
| 필드 | 타입 | 설명 |
|------|------|------|
| file | File | 영상 파일 (MP4, MOV, 최대 500MB) |

**응답 `201`**:
```json
{
  "video_uri": "storage://path/to/uploaded/video.mp4"
}
```

**에러**:
- `413`: 파일 크기 초과
- `400`: 지원하지 않는 파일 형식

---

## 3. 더빙 작업

### GET /api/dubbing

로그인 사용자의 더빙 이력 목록을 반환한다. 최신순 정렬.

**응답 `200`**:
```json
[
  {
    "id": "uuid",
    "title": "파일명.mp4",
    "thumbnail_url": "https://..." ,  // nullable
    "source_language": "ko",
    "target_language": "en",
    "status": "completed",  // "uploading" | "processing" | "completed" | "failed"
    "created_at": "2026-04-13T14:30:00Z",
    "file_size_bytes": 15200000,
    "duration_seconds": 90
  }
]
```

### POST /api/dubbing

새 더빙 작업을 생성한다.

**요청**:
```json
{
  "video_uri": "storage://path/to/video.mp4",
  "file_name": "파일명.mp4",
  "source_language": "ko",
  "target_language": "en"
}
```

- `source_language`, `target_language`: `"ko"` | `"en"` | `"ja"` | `"zh"` | `"es"`

**응답 `201`**:
```json
{
  "id": "uuid",
  "status": "processing"
}
```

### GET /api/dubbing/{id}

더빙 작업 상세 정보를 반환한다.

**응답 `200`**:
```json
{
  "id": "uuid",
  "title": "파일명.mp4",
  "thumbnail_url": "https://...",
  "source_language": "ko",
  "target_language": "en",
  "status": "completed",
  "created_at": "2026-04-13T14:30:00Z",
  "file_size_bytes": 15200000,
  "duration_seconds": 90,
  "original_video_url": "https://...",
  "dubbed_video_url": "https://...",  // nullable (완료 전에는 null)
  "completed_at": "2026-04-13T14:35:00Z"  // nullable
}
```

### GET /api/dubbing/{id}/status

더빙 진행 상태를 반환한다. 프론트에서 3초 간격으로 폴링한다.

**응답 `200`**:
```json
{
  "id": "uuid",
  "status": "processing",
  "current_step": "analyze_speech",
  "progress_percent": 65,
  "estimated_remaining_seconds": 150,  // nullable
  "steps": [
    { "step": "upload", "status": "done" },
    { "step": "extract_audio", "status": "done" },
    { "step": "analyze_speech", "status": "in_progress" },
    { "step": "synthesize_dubbing", "status": "pending" }
  ]
}
```

- `current_step`: `"upload"` | `"extract_audio"` | `"analyze_speech"` | `"synthesize_dubbing"`
- `steps[].status`: `"done"` | `"in_progress"` | `"pending"`

### GET /api/dubbing/{id}/download

더빙된 영상의 다운로드 URL을 반환한다. (presigned URL 등)

**응답 `200`**:
```json
{
  "url": "https://...presigned-download-url..."
}
```

**에러**:
- `404`: 아직 더빙이 완료되지 않음

---

## 4. 지원 언어 코드

| 코드 | 언어 |
|------|------|
| `ko` | 한국어 |
| `en` | 영어 |
| `ja` | 일본어 |
| `zh` | 중국어 |
| `es` | 스페인어 |

---

## 5. 폴링 전략

- **엔드포인트**: `GET /api/dubbing/{id}/status`
- **주기**: 3초
- **종료 조건**: `status === "completed"` 또는 `status === "failed"`
- **앱 백그라운드 시**: 폴링 중단, 포그라운드 복귀 시 재개

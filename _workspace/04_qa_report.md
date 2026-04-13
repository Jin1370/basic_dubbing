# QA 검증 보고서

**검증일**: 2026-04-13
**검증 대상**: 프론트엔드(Expo/TypeScript) - 백엔드(FastAPI/Pydantic) 통합 정합성

---

## 검증 요약

| # | 검증 항목 | 상태 | 이슈 수 |
|---|----------|------|---------|
| 1 | API 타입 정합성 | PASS | 0 |
| 2 | API 경로 정합성 | PASS | 0 |
| 3 | 인증 흐름 검증 | WARN | 1 |
| 4 | 더빙 상태 흐름 검증 | PASS | 0 |
| 5 | 네비게이션 경로 검증 | PASS | 0 |

**총 이슈**: Critical 0 / Major 0 / Minor 1

---

## 1. API 타입 정합성

### 검증 방법
`server/models/schemas.py`의 Pydantic 모델 필드명/타입과 `lib/types.ts`의 TypeScript 인터페이스 필드명/타입을 1:1 대조했다.

### 1-1. UserProfile

| 필드 | Pydantic (schemas.py:48-52) | TypeScript (types.ts:89-94) | 일치 |
|------|---------------------------|---------------------------|------|
| id | `str` | `string` | O |
| email | `str` | `string` | O |
| display_name | `str` | `string` | O |
| avatar_url | `Optional[str]` | `string \| null` | O |

**상태**: PASS

### 1-2. DubbingItem

| 필드 | Pydantic (schemas.py:77-87) | TypeScript (types.ts:42-52) | 일치 |
|------|---------------------------|---------------------------|------|
| id | `str` | `string` | O |
| title | `str` | `string` | O |
| thumbnail_url | `Optional[str]` | `string \| null` | O |
| source_language | `LanguageCode` | `LanguageCode` | O |
| target_language | `LanguageCode` | `LanguageCode` | O |
| status | `DubbingStatus` | `DubbingStatus` | O |
| created_at | `str` (ISO 8601) | `string` (ISO 8601) | O |
| file_size_bytes | `int` | `number` | O |
| duration_seconds | `int` | `number` | O |

**상태**: PASS

### 1-3. DubbingDetail (extends DubbingItem)

| 필드 | Pydantic (schemas.py:89-92) | TypeScript (types.ts:55-59) | 일치 |
|------|---------------------------|---------------------------|------|
| original_video_url | `str` | `string` | O |
| dubbed_video_url | `Optional[str]` | `string \| null` | O |
| completed_at | `Optional[str]` | `string \| null` | O |

**상태**: PASS

### 1-4. DubbingProgress

| 필드 | Pydantic (schemas.py:100-106) | TypeScript (types.ts:62-72) | 일치 |
|------|------------------------------|---------------------------|------|
| id | `str` | `string` | O |
| status | `DubbingStatus` | `DubbingStatus` | O |
| current_step | `DubbingStep` | `DubbingStep` | O |
| progress_percent | `int` | `number` | O |
| estimated_remaining_seconds | `Optional[int]` | `number \| null` | O |
| steps | `list[StepProgress]` | `{ step: DubbingStep; status: ... }[]` | O |

StepProgress 내부:
| 필드 | Pydantic (schemas.py:95-97) | TypeScript (types.ts:69-71) | 일치 |
|------|---------------------------|---------------------------|------|
| step | `DubbingStep` | `DubbingStep` | O |
| status | `StepStatus` | `'done' \| 'in_progress' \| 'pending'` | O |

**상태**: PASS

### 1-5. CreateDubbingRequest

| 필드 | Pydantic (schemas.py:63-67) | TypeScript (types.ts:75-80) | 일치 |
|------|---------------------------|---------------------------|------|
| video_uri | `str` | `string` | O |
| file_name | `str` | `string` | O |
| source_language | `LanguageCode` | `LanguageCode` | O |
| target_language | `LanguageCode` | `LanguageCode` | O |

**상태**: PASS

### 1-6. CreateDubbingResponse

| 필드 | Pydantic (schemas.py:72-74) | TypeScript (types.ts:83-86) | 일치 |
|------|---------------------------|---------------------------|------|
| id | `str` | `string` | O |
| status | `DubbingStatus` | `DubbingStatus` | O |

**상태**: PASS

### 1-7. ApiError / ErrorResponse

| 필드 | Pydantic (schemas.py:127-129) | TypeScript (types.ts:97-100) | 일치 |
|------|------------------------------|---------------------------|------|
| detail | `str` | `string` | O |
| code | `Optional[str]` | `string?` (optional) | O |

**상태**: PASS

### 1-8. Enum 값 비교

| Enum | Pydantic 값 | TypeScript 값 | 일치 |
|------|------------|--------------|------|
| LanguageCode | ko, en, ja, zh, es | ko, en, ja, zh, es | O |
| DubbingStatus | uploading, processing, completed, failed | uploading, processing, completed, failed | O |
| DubbingStep | upload, extract_audio, analyze_speech, synthesize_dubbing | upload, extract_audio, analyze_speech, synthesize_dubbing | O |
| StepStatus | done, in_progress, pending | done, in_progress, pending | O |

**상태**: PASS

### 1-9. 필드명 케이스 규칙

양쪽 모두 **snake_case**를 사용한다. camelCase/snake_case 변환 이슈 없음.
- Pydantic: snake_case (기본)
- TypeScript: snake_case (프론트엔드 계약서 기준)

**상태**: PASS

---

## 2. API 경로 정합성

### 검증 방법
`server/routers/*.py`의 모든 엔드포인트(데코레이터 경로 + prefix)와 `lib/api.ts`의 axios 호출 URL + HTTP 메서드를 대조했다.

### 백엔드 엔드포인트 목록 (라우터 파일 기준)

| # | 메서드 | 경로 | 라우터 | 라인 | 인증 |
|---|--------|------|--------|------|------|
| 1 | POST | /api/auth/google | auth.py | 24-30 | X |
| 2 | GET | /api/users/me | auth.py | 79-84 | O |
| 3 | POST | /api/upload | videos.py | 27-36 | O |
| 4 | GET | /api/dubbing | dubbing.py | 32-36 | O |
| 5 | POST | /api/dubbing | dubbing.py | 42-49 | O |
| 6 | GET | /api/dubbing/{job_id} | dubbing.py | 67-73 | O |
| 7 | GET | /api/dubbing/{job_id}/status | dubbing.py | 89-95 | O |
| 8 | GET | /api/dubbing/{job_id}/download | videos.py | 82-87 | O |

### 프론트엔드 API 호출 목록 (api.ts 기준)

| # | 메서드 | 경로 (baseURL=/api 기준) | 전체 경로 | 함수 | 라인 |
|---|--------|------------------------|----------|------|------|
| 1 | GET | /users/me | /api/users/me | fetchProfile | 62 |
| 2 | GET | /dubbing | /api/dubbing | fetchDubbingList | 68 |
| 3 | GET | /dubbing/${id} | /api/dubbing/{id} | fetchDubbingDetail | 74 |
| 4 | GET | /dubbing/${id}/status | /api/dubbing/{id}/status | fetchDubbingProgress | 80 |
| 5 | POST | /upload | /api/upload | uploadVideo | 99 |
| 6 | POST | /dubbing | /api/dubbing | createDubbing | 110 |
| 7 | GET | /dubbing/${id}/download | /api/dubbing/{id}/download | fetchDownloadUrl | 116 |

### 매핑 결과

| 프론트 호출 | 백엔드 엔드포인트 | 메서드 일치 | 경로 일치 |
|------------|-----------------|-----------|----------|
| fetchProfile → GET /api/users/me | GET /api/users/me | O | O |
| fetchDubbingList → GET /api/dubbing | GET /api/dubbing | O | O |
| fetchDubbingDetail → GET /api/dubbing/{id} | GET /api/dubbing/{job_id} | O | O |
| fetchDubbingProgress → GET /api/dubbing/{id}/status | GET /api/dubbing/{job_id}/status | O | O |
| uploadVideo → POST /api/upload | POST /api/upload | O | O |
| createDubbing → POST /api/dubbing | POST /api/dubbing | O | O |
| fetchDownloadUrl → GET /api/dubbing/{id}/download | GET /api/dubbing/{job_id}/download | O | O |

### 미사용 엔드포인트

| 엔드포인트 | 사용 여부 | 비고 |
|-----------|----------|------|
| POST /api/auth/google | 프론트 api.ts에서 미호출 | 프론트엔드는 Supabase Auth의 `signInWithOAuth`를 직접 사용하므로 이 엔드포인트를 호출하지 않음. auth.ts:22 참조. 백엔드에 구현은 되어 있으나 현재 프론트엔드 인증 흐름에서 사용되지 않음. |

**상태**: PASS
**비고**: POST /api/auth/google은 프론트에서 직접 호출하지 않지만, 프론트 인증이 Supabase Auth SDK를 통한 OAuth 방식이므로 백엔드 엔드포인트가 별도로 필요하지 않다. 향후 다른 클라이언트(웹 등)에서 사용할 수 있으므로 존재 자체는 문제 아님.

---

## 3. 인증 흐름 검증

### 3-1. Authorization 헤더 첨부 방식

**프론트엔드** (api.ts:29-35):
```
인터셉터에서 getAccessToken() 호출 → Supabase session.access_token 반환
→ config.headers.Authorization = `Bearer ${token}`
```

**백엔드** (middleware/auth.py:19, 44-46):
```
HTTPBearer() 스킴으로 Authorization: Bearer {token} 파싱
→ credentials.credentials로 토큰 추출
→ jose.jwt.decode()로 검증 (HS256, audience="authenticated")
```

**결과**: Bearer JWT 형식 일치. **PASS**

### 3-2. 토큰 형식

| 항목 | 프론트엔드 | 백엔드 | 일치 |
|------|----------|--------|------|
| 형식 | Bearer {supabase_jwt} | Bearer {token} (HTTPBearer) | O |
| 토큰 소스 | supabase.auth.getSession().access_token (auth.ts:58-59) | SUPABASE_JWT_SECRET으로 검증 (auth.py:21, 29-34) | O |
| 알고리즘 | Supabase 기본 HS256 | HS256 (auth.py:22) | O |
| audience | Supabase 기본 "authenticated" | "authenticated" (auth.py:23) | O |

**상태**: PASS

### 3-3. 인증 필요 엔드포인트 vs 프론트 인증 상태 관리

**백엔드 인증 필요 엔드포인트** (Depends(get_current_user) 또는 Depends(get_user_id) 사용):
- GET /api/users/me (auth.py:85-86)
- POST /api/upload (videos.py:39)
- GET /api/dubbing (dubbing.py:37)
- POST /api/dubbing (dubbing.py:53)
- GET /api/dubbing/{id} (dubbing.py:76)
- GET /api/dubbing/{id}/status (dubbing.py:99)
- GET /api/dubbing/{id}/download (videos.py:92)

**백엔드 인증 불필요 엔드포인트**:
- POST /api/auth/google (auth.py:30)
- GET /health (스펙 문서 기준)

**프론트엔드 인증 관리**:
- 루트 레이아웃(_layout.tsx:22-31): `session`이 null이면 `/(auth)/login`으로 리다이렉트
- `(main)` 그룹의 모든 화면은 인증 완료 상태에서만 접근 가능
- api.ts의 인터셉터가 모든 API 요청에 토큰을 첨부 (29-35행)

**결과**: 인증 필요 엔드포인트는 모두 `(main)` 그룹 화면에서만 호출되며, 해당 그룹은 인증 상태에서만 접근 가능. **PASS**

### 3-4. 401 에러 처리

| 항목 | 위치 | 내용 |
|------|------|------|
| 프론트 401 처리 | api.ts:45-47 | 401 수신 시 "인증이 만료되었습니다" 에러 반환. 주석에 "세션 리스너가 담당"이라고 명시. |
| 백엔드 401 응답 | middleware/auth.py:37-41 | JWTError 시 401 + "유효하지 않은 인증 토큰입니다." |
| 프론트 세션 리스너 | store.ts:50-57 | onAuthStateChange로 세션 변경 감지. 세션 null이면 profile null 설정. |
| 루트 레이아웃 | _layout.tsx:27-28 | session null + 비인증그룹이면 로그인 화면으로 리다이렉트 |

**상태**: WARN
**심각도**: Minor
**위치**: `lib/api.ts:45-47`, `lib/store.ts:50-57`
**설명**: 401 에러 수신 시 프론트엔드가 Supabase 세션 리스너에 의존하여 자동 리다이렉트되기를 기대하지만, JWT 만료와 Supabase 세션 만료 타이밍이 다를 수 있다. 서버에서 401을 받아도 Supabase 클라이언트 측 세션이 아직 유효하다고 판단하면 `onAuthStateChange`가 트리거되지 않아, 사용자가 인증 만료 상태에서 에러 메시지만 보고 로그인 화면으로 자동 전환되지 않을 수 있다. 명시적으로 `supabase.auth.signOut()`을 호출하거나 세션을 무효화하는 로직 추가를 권장한다.

---

## 4. 더빙 상태 흐름 검증

### 4-1. 상태 값 비교

**백엔드 DubbingStatus** (schemas.py:26-30):
```
uploading | processing | completed | failed
```

**프론트엔드 DubbingStatus** (types.ts:18):
```
'uploading' | 'processing' | 'completed' | 'failed'
```

**결과**: 완전 일치. **PASS**

### 4-2. 프론트엔드 상태 처리 로직

| 상태 | 처리 위치 | 처리 내용 |
|------|----------|----------|
| uploading | 프론트 계약서:86 DubbingItem.status | 이력 목록에서 표시용으로 사용됨 |
| processing | progress/[id].tsx:41-48 | 폴링 계속. 현재 단계/진행률 표시 |
| completed | progress/[id].tsx:41-43 | 폴링 중단, result/{id} 화면으로 이동 |
| failed | progress/[id].tsx:44-48 | 폴링 중단, 에러 Alert 표시 후 홈으로 이동 |

**상태**: PASS — 4개 상태 모두 프론트엔드에서 처리됨.

### 4-3. 상태 전이 순서

```
uploading → processing → completed
                       → failed
```

- 백엔드: POST /api/dubbing 생성 시 `processing` 상태 반환 (dubbing.py:57-58). `uploading` 상태는 프론트에서 업로드 중인 로컬 상태로 사용될 수 있음.
- 프론트: 업로드(uploadVideo) → 작업 생성(createDubbing, status="processing") → 폴링 시작 → completed/failed 종료

**상태**: PASS — 전이 순서 논리적.

### 4-4. 더빙 단계(Step) 값 비교

**백엔드 DubbingStep** (schemas.py:33-37):
```
upload | extract_audio | analyze_speech | synthesize_dubbing
```

**프론트엔드 DubbingStep** (types.ts:21-25):
```
'upload' | 'extract_audio' | 'analyze_speech' | 'synthesize_dubbing'
```

**프론트엔드 단계 순서** (types.ts:34-39):
```
DUBBING_STEPS_ORDER = ['upload', 'extract_audio', 'analyze_speech', 'synthesize_dubbing']
```

**결과**: 완전 일치. **PASS**

### 4-5. StepStatus 값 비교

**백엔드** (schemas.py:40-43): `done | in_progress | pending`
**프론트엔드** (types.ts:70): `'done' | 'in_progress' | 'pending'`

**결과**: 완전 일치. **PASS**

---

## 5. 네비게이션 경로 검증

### 5-1. Expo Router 파일 구조에서 추출한 경로

| 파일 경로 | Expo Router 경로 |
|----------|-----------------|
| app/_layout.tsx | / (루트 레이아웃) |
| app/(auth)/_layout.tsx | (auth) 그룹 레이아웃 |
| app/(auth)/login.tsx | /(auth)/login |
| app/(main)/_layout.tsx | (main) 그룹 레이아웃 |
| app/(main)/index.tsx | /(main) |
| app/(main)/upload.tsx | /(main)/upload |
| app/(main)/dubbing-settings.tsx | /(main)/dubbing-settings |
| app/(main)/progress/[id].tsx | /(main)/progress/{id} |
| app/(main)/result/[id].tsx | /(main)/result/{id} |

### 5-2. 코드 내 네비게이션 호출 수집

| 호출 | 파일 | 라인 | 대상 경로 | 실제 파일 존재 |
|------|------|------|----------|--------------|
| `router.replace('/(auth)/login')` | app/_layout.tsx | 28 | /(auth)/login | O (app/(auth)/login.tsx) |
| `router.replace('/(main)')` | app/_layout.tsx | 30 | /(main) | O (app/(main)/index.tsx) |
| `router.push('/(main)/upload')` | app/(main)/index.tsx | 32 | /(main)/upload | O (app/(main)/upload.tsx) |
| `router.push('/(main)/result/${id}')` | app/(main)/index.tsx | 38 | /(main)/result/{id} | O (app/(main)/result/[id].tsx) |
| `router.back()` | app/(main)/upload.tsx | 83 | (이전 화면) | N/A |
| `router.push('/(main)/dubbing-settings')` | app/(main)/upload.tsx | 74 | /(main)/dubbing-settings | O (app/(main)/dubbing-settings.tsx) |
| `router.back()` | app/(main)/dubbing-settings.tsx | 82 | (이전 화면) | N/A |
| `router.replace('/(main)/progress/${result.id}')` | app/(main)/dubbing-settings.tsx | 68 | /(main)/progress/{id} | O (app/(main)/progress/[id].tsx) |
| `router.replace('/(main)/result/${id}')` | app/(main)/progress/[id].tsx | 43 | /(main)/result/{id} | O (app/(main)/result/[id].tsx) |
| `router.replace('/(main)')` | app/(main)/progress/[id].tsx | 47, 87 | /(main) | O (app/(main)/index.tsx) |
| `router.back()` | app/(main)/result/[id].tsx | 94, 121 | (이전 화면) | N/A |
| `router.push('/(main)/upload')` | app/(main)/result/[id].tsx | 78 | /(main)/upload | O (app/(main)/upload.tsx) |

**상태**: PASS — 모든 네비게이션 대상 경로가 실제 파일과 매칭됨.

### 5-3. 화면 흐름 요약

```
로그인 ─(인증완료)→ 홈(이력 목록)
   │                    │
   │                    ├─(항목 탭)→ 결과 화면
   │                    │
   │                    └─(FAB)→ 영상 선택 →(다음)→ 더빙 설정 →(시작)→ 진행 화면
   │                                                                    │
   │                                                    (완료)→ 결과 화면
   │                                                    (실패)→ 홈
   └─(로그아웃/세션만료)← 루트 레이아웃 리다이렉트
```

**상태**: PASS — 흐름에 끊김 없음.

---

## 이슈 목록

| # | 검증 항목 | 상태 | 심각도 | 위치 | 설명 |
|---|----------|------|--------|------|------|
| 1 | 인증 흐름 | WARN | Minor | lib/api.ts:45-47, lib/store.ts:50-57 | 서버 401 응답 시 Supabase 세션 리스너만으로는 로그인 화면 자동 전환이 보장되지 않음. 명시적 세션 무효화 로직 추가 권장. |

---

## 결론

프론트엔드와 백엔드의 통합 정합성은 전반적으로 **양호**하다.

- **API 타입**: 7개 모델 + 4개 Enum 모두 필드명/타입 완전 일치. snake_case 통일.
- **API 경로**: 프론트가 호출하는 7개 엔드포인트 모두 백엔드에 존재. 메서드 일치.
- **인증 흐름**: Bearer JWT 형식, 알고리즘, audience 일치. 401 처리에 Minor 개선 사항 1건.
- **더빙 상태**: 4개 상태 + 4개 단계 + 3개 단계상태 모두 양쪽 일치. 전이 순서 논리적.
- **네비게이션**: 12개 네비게이션 호출 모두 실제 화면 파일과 매칭. 끊김 없음.

Critical/Major 이슈 없음. Minor 이슈 1건(인증 만료 시 자동 리다이렉트 보장 관련)은 edge case로, 실사용에 큰 영향은 없으나 개선 권장.

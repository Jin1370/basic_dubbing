# Basic Dubbing

Perso AI API를 활용한 모바일 더빙 앱. 영상을 업로드하면 AI가 더빙을 생성한다.

## 기술 스택

| 영역 | 스택 |
|------|------|
| 프론트엔드 | Expo (React Native + TypeScript) |
| 백엔드 | FastAPI (Python) |
| 외부 API | Perso AI API |
| 인프라 | Supabase (Auth + Database + Storage) |

## 프로젝트 구조

```
app/                  # Expo Router 화면
  (auth)/             # 인증 관련 화면 (로그인)
  (main)/             # 메인 화면 (업로드, 더빙 설정, 진행, 결과)
components/           # 공용 UI 컴포넌트
constants/            # 테마 토큰, 설정 상수
lib/                  # API 클라이언트, Supabase 클라이언트
server/               # FastAPI 백엔드
  routers/            # API 엔드포인트 (auth, dubbing, videos)
  services/           # 비즈니스 로직 (Perso AI 연동)
  models/             # Pydantic 모델, DB 스키마
  middleware/         # 인증 미들웨어
  migrations/         # SQL 마이그레이션
```

## 시작하기

### 사전 요구사항

- Node.js 18+
- Python 3.11+
- Expo CLI (`npx expo`)
- Supabase 프로젝트 (Auth + Database + Storage)
- Perso AI API 키

### 프론트엔드 설치 및 실행

```bash
npm install
npx expo start
```

### 백엔드 설치 및 실행

```bash
cd server
pip install -r requirements.txt
```

`.env` 파일을 `server/` 디렉터리에 생성:

```env
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_KEY=<your-service-key>
SUPABASE_JWT_SECRET=<your-jwt-secret>
PERSO_AI_API_KEY=<your-perso-ai-key>
CORS_ORIGINS=["http://localhost:8081"]
```

서버 실행:

```bash
uvicorn server.main:app --reload
```

### 데이터베이스 설정

Supabase SQL Editor에서 마이그레이션 스크립트 실행:

```bash
# server/migrations/001_init.sql 내용을 Supabase SQL Editor에 붙여넣기
```

## 주요 화면

| 화면 | 경로 | 설명 |
|------|------|------|
| 로그인 | `(auth)/login` | Supabase Auth로 로그인 |
| 홈 | `(main)/index` | 영상 목록 및 대시보드 |
| 업로드 | `(main)/upload` | 영상 업로드 |
| 더빙 설정 | `(main)/dubbing-settings` | 언어, 음성 등 더빙 옵션 설정 |
| 진행 | `(main)/progress` | 더빙 진행 상태 |
| 결과 | `(main)/result` | 더빙 결과 확인 및 다운로드 |

## API 엔드포인트

| Method | 경로 | 설명 |
|--------|------|------|
| POST | `/auth/login` | 로그인 |
| POST | `/videos/upload` | 영상 업로드 |
| GET | `/videos` | 영상 목록 조회 |
| POST | `/dubbing/start` | 더빙 시작 |
| GET | `/dubbing/{id}/status` | 더빙 상태 조회 |
| GET | `/dubbing/{id}/result` | 더빙 결과 조회 |

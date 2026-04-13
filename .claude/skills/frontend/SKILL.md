---
name: dubbing-frontend
description: "모바일 더빙 앱의 Expo(React Native + TypeScript) 프론트엔드 구현 스킬. 화면 구현, 네비게이션, 상태 관리, API 연동, Supabase Auth 통합을 수행한다. '프론트엔드 구현', '화면 만들기', 'Expo 앱', '앱 구현', '화면 코딩', 'UI 구현' 등 프론트엔드 관련 작업 요청 시 이 스킬을 사용할 것."
---

# 모바일 더빙 앱 프론트엔드 스킬

## 기술 스택

- **Expo** (React Native + TypeScript)
- **Expo Router** — 파일 기반 네비게이션
- **Zustand** — 상태 관리
- **Axios** — HTTP 클라이언트
- **Supabase JS** — 인증 연동

## 프로젝트 구조

```
app/
├── (auth)/
│   ├── login.tsx          # Google 로그인
│   └── _layout.tsx
├── (main)/
│   ├── index.tsx          # 홈 (더빙 이력)
│   ├── upload.tsx         # 영상 업로드
│   ├── settings.tsx       # 더빙 설정 (언어 선택)
│   ├── progress/[id].tsx  # 더빙 진행 상태
│   ├── result/[id].tsx    # 결과 확인
│   └── _layout.tsx
├── _layout.tsx            # 루트 레이아웃
components/
├── VideoCard.tsx          # 더빙 이력 카드
├── LanguageSelector.tsx   # 언어 선택기
├── ProgressBar.tsx        # 더빙 진행 바
└── VideoPlayer.tsx        # 영상 재생기
lib/
├── api.ts                 # Axios 인스턴스 + API 함수
├── auth.ts                # Supabase Auth 헬퍼
├── store.ts               # Zustand 스토어
└── types.ts               # 공유 타입 정의
```

## 구현 원칙

1. **디자인 스펙 우선**: `_workspace/01_design_spec.md`의 색상, 타이포, 컴포넌트 스타일을 따른다.
2. **타입 안전성**: API 응답 타입을 `lib/types.ts`에 정의하고, 백엔드 Pydantic 모델과 일치시킨다.
3. **인증 흐름**: Supabase Auth로 Google 로그인 → JWT 토큰을 Axios 인터셉터에서 Authorization 헤더에 자동 첨부.
4. **더빙 상태 폴링**: 더빙 작업 생성 후 `/api/dubbing/{id}/status` 엔드포인트를 주기적으로 폴링하여 진행 상태를 표시한다.
5. **에러 처리**: 네트워크 에러, 인증 만료, 더빙 실패 각각에 대한 사용자 안내 메시지를 표시한다.

## API 계약 문서

프론트엔드 구현 시 기대하는 API 형식을 `_workspace/02_frontend_api_contract.md`에 기록한다. 이 문서는 backend 에이전트와의 계약서 역할을 한다.

## 산출물

- `app/` — Expo 앱 소스코드
- `components/` — 재사용 컴포넌트
- `lib/` — 유틸리티 및 타입
- `_workspace/02_frontend_api_contract.md` — API 계약서

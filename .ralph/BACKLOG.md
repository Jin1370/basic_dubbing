# BACKLOG

## P0 (지금 바로)
- [x] tsc --noEmit 실행하여 전체 타입 에러 수정
- [x] lib/api.ts — 401 응답 시 supabase.auth.signOut() 호출 로직 추가 (QA Minor 이슈)
- [x] app/_layout.tsx — SafeAreaProvider 래핑 누락 수정

## P1
- [x] constants/theme.ts 생성 — 디자인 스펙의 색상/타이포/간격 토큰을 상수로 분리
- [x] 각 화면에 하드코딩된 색상값을 theme 상수로 교체
- [blocked] components/ 전체 lint 에러 수정 — ESLint 미설정, 환경 구축 필요
- [x] server/main.py — CORS origin을 환경변수로 분리 (이미 구현됨 확인)
- [x] server/models/database.py — Supabase 테이블 생성 SQL 스크립트 작성

## P2
- [ ] README.md 작성 (프로젝트 소개, 설치 방법, 실행 방법)
- [ ] app.json — splash 화면 및 아이콘 설정 정리
- [ ] 프론트엔드 유닛 테스트 환경 구성 (jest + @testing-library/react-native)
- [ ] 백엔드 유닛 테스트 환경 구성 (pytest)

## 자가 생성 가능 풀 (BACKLOG 고갈 시 여기서 뽑거나 새로 채움)
- ESLint + Prettier 환경 구축 후 lint 수정
- 테스트 보강, 문서, 리팩터, 관측성, 타입 강화, 에러 핸들링 개선

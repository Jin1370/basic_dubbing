# 모바일 더빙 앱 요구사항

## 개요
Perso AI API를 활용하여 영상을 다른 언어로 더빙하는 모바일 앱.

## 기술 스택
- 프론트엔드: Expo (React Native + TypeScript)
- 백엔드: FastAPI (Python)
- 외부 API: Perso AI API
- 인프라: Supabase (Auth + Database + Storage)

## 핵심 기능
1. Google 로그인 (Supabase Auth)
2. 영상 업로드 (갤러리 선택)
3. 원본 언어 / 타겟 언어 선택
4. AI 더빙 실행 (Perso AI API)
5. 더빙 진행 상태 표시
6. 결과 영상 재생 및 다운로드
7. 더빙 이력 관리

## 핵심 플로우
로그인 → 홈(이력) → 영상 업로드 → 언어 선택 → 더빙 진행 → 결과 확인

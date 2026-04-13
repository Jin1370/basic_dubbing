# 2026-04-13 — P2: 프론트엔드 유닛 테스트 환경 구성

## BACKLOG 항목
- [P2] 프론트엔드 유닛 테스트 환경 구성 (jest + @testing-library/react-native)

## 접근
1. jest, jest-expo, @testing-library/react-native, @types/jest, react-test-renderer 설치 (--legacy-peer-deps 필요)
2. Jest 30은 Expo SDK 54의 winter polyfill(import.meta)과 호환 안 됨 → Jest 29로 다운그레이드
3. jest.config.js: `jest-expo` preset 사용, transformIgnorePatterns 설정
4. jest.setup.js: structuredClone polyfill 추가
5. ProgressBar 컴포넌트에 대한 샘플 테스트 3개 작성
6. `getByRole('progressbar')` → RNTL 13에서 accessibilityRole 매핑 문제 → `getByLabelText`로 변경

## 대안 고려
- Jest 30 + jest-expo: Expo SDK 54 winter polyfill과 incompatible (ReferenceError: import outside scope)
- react-native preset 직접 사용: babel config 없어서 TSX 파싱 실패

## 변경 파일
- `jest.config.js` — 신규 생성
- `jest.setup.js` — 신규 생성
- `__tests__/components/ProgressBar.test.tsx` — 샘플 테스트
- `package.json` — test 스크립트 추가, devDependencies 추가

## 테스트 결과
- `npx jest` — 3/3 pass
- `npx tsc --noEmit` — 성공

## 다음 루프 주의사항
- Jest 29 사용 중 (30은 Expo SDK 54와 호환 안 됨)
- --legacy-peer-deps로 설치됨
- `getByRole`가 accessibilityRole과 매핑되지 않는 이슈 있음 → getByLabelText 사용
- P2 다음: 백엔드 유닛 테스트 환경 구성 (pytest)

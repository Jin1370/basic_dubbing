# 2026-04-13 — P1: 디자인 토큰 분리 및 적용

## BACKLOG 항목
- [P1] constants/theme.ts 생성 — 디자인 스펙의 색상/타이포/간격 토큰을 상수로 분리
- [P1] 각 화면에 하드코딩된 색상값을 theme 상수로 교체

## 접근 방식
1. 코드베이스 전체의 하드코딩 hex 색상을 grep으로 수집
2. Tailwind/Slate 기반 색상 팔레트를 `constants/theme.ts`에 정의
   - colors: primary, primaryLight, white, black, slate50~900, success/warning/error + bg variants
   - fontSize, lineHeight, spacing, radius 토큰도 포함
3. 모든 화면(8개 tsx)과 컴포넌트(4개 tsx)에서 하드코딩 hex → `colors.*` 상수로 교체
4. `rgba()` 그림자 색상은 의도적으로 유지 (theme 레벨에서 관리할 필요 낮음)

## 변경 파일
- `constants/theme.ts` — 신규 생성
- `app/_layout.tsx` — colors import + 적용
- `app/(auth)/login.tsx` — colors 적용
- `app/(main)/_layout.tsx` — colors 적용
- `app/(main)/index.tsx` — colors 적용
- `app/(main)/upload.tsx` — colors 적용
- `app/(main)/dubbing-settings.tsx` — colors 적용
- `app/(main)/progress/[id].tsx` — colors 적용
- `app/(main)/result/[id].tsx` — colors 적용
- `components/ProgressBar.tsx` — colors 적용
- `components/VideoCard.tsx` — colors 적용
- `components/LanguageSelector.tsx` — colors 적용
- `components/VideoPlayer.tsx` — colors 적용

## 테스트 결과
- `npx tsc --noEmit` — 성공 (에러 0건)
- grep '#[0-9A-Fa-f]{6}' 결과: app/ 및 components/ 에서 0건

## 다음 루프 주의사항
- fontSize, lineHeight, spacing, radius 토큰은 아직 화면에 적용하지 않았음 (색상만 완료)
- 필요 시 후속 iteration에서 적용 가능하나, 색상보다 우선순위 낮음

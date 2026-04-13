# 모바일 더빙 앱 — 디자인 스펙

---

## 1. 색상 팔레트

| 용도 | 이름 | Hex | 설명 |
|------|------|-----|------|
| Primary | Blue 600 | `#2563EB` | 주요 버튼, 활성 상태, 링크 |
| Primary Dark | Blue 700 | `#1D4ED8` | 버튼 pressed 상태 |
| Primary Light | Blue 50 | `#EFF6FF` | 배지 배경, 선택 상태 배경 |
| Secondary | Slate 600 | `#475569` | 보조 버튼, 비활성 텍스트 |
| Background | White | `#FFFFFF` | 기본 배경 |
| Surface | Gray 50 | `#F8FAFC` | 카드 배경, 입력 필드 배경 |
| Text Primary | Slate 900 | `#0F172A` | 제목, 본문 텍스트 |
| Text Secondary | Slate 500 | `#64748B` | 부가 텍스트, 캡션 |
| Text Inverse | White | `#FFFFFF` | Primary 버튼 위 텍스트 |
| Border | Gray 200 | `#E2E8F0` | 카드 테두리, 구분선 |
| Error | Red 500 | `#EF4444` | 에러 메시지, 실패 상태 |
| Error Light | Red 50 | `#FEF2F2` | 에러 배경 |
| Success | Green 500 | `#22C55E` | 완료 상태, 성공 메시지 |
| Success Light | Green 50 | `#F0FDF4` | 성공 배경 |
| Warning | Amber 500 | `#F59E0B` | 경고, 처리중 상태 |
| Progress Bar Fill | Blue 600 | `#2563EB` | 프로그레스 바 채움 |
| Progress Bar Track | Gray 200 | `#E2E8F0` | 프로그레스 바 트랙 |

---

## 2. 타이포그래피

시스템 폰트 사용 (iOS: SF Pro, Android: Roboto).

| 스타일 | 크기 | 무게 | 행간 | 용도 |
|--------|------|------|------|------|
| H1 | 28px | Bold (700) | 36px | 온보딩 앱 이름 |
| H2 | 22px | SemiBold (600) | 28px | 화면 제목 |
| H3 | 18px | SemiBold (600) | 24px | 섹션 제목 |
| Body | 16px | Regular (400) | 24px | 본문, 설명 텍스트 |
| Body Bold | 16px | SemiBold (600) | 24px | 강조 본문, 레이블 |
| Caption | 13px | Regular (400) | 18px | 부가 정보, 타임스탬프 |
| Caption Bold | 13px | Medium (500) | 18px | 배지, 상태 텍스트 |
| Button | 16px | SemiBold (600) | 20px | 버튼 텍스트 |

---

## 3. 간격 시스템

기본 단위: 4px

| 토큰 | 값 | 용도 |
|------|-----|------|
| `space-xs` | 4px | 아이콘과 텍스트 사이 |
| `space-sm` | 8px | 인접 요소 간 간격 |
| `space-md` | 12px | 리스트 아이템 간 간격 |
| `space-lg` | 16px | 섹션 내부 패딩, 카드 내부 패딩 |
| `space-xl` | 24px | 화면 좌우 패딩 |
| `space-2xl` | 32px | 섹션 간 간격 |
| `space-3xl` | 40px | 큰 여백 |
| `space-4xl` | 60px | 온보딩 상단 여백 |

**화면 레이아웃:**
- 좌우 패딩: 24px
- 상단 SafeArea 패딩: 기기별 동적
- 하단 SafeArea 패딩: 기기별 동적 + 16px 추가

---

## 4. 컴포넌트 스타일

### 4.1 버튼

**Primary 버튼**
- 배경: `#2563EB`
- 텍스트: `#FFFFFF`, Button 스타일
- 높이: 48px
- 모서리 반경: 12px
- 좌우 패딩: 24px
- Pressed: 배경 `#1D4ED8`
- Disabled: 배경 `#94A3B8`, 텍스트 `#FFFFFF` (opacity 0.6)

**Secondary 버튼**
- 배경: `#FFFFFF`
- 테두리: 1.5px `#2563EB`
- 텍스트: `#2563EB`, Button 스타일
- 높이: 48px
- 모서리 반경: 12px
- Pressed: 배경 `#EFF6FF`

**FAB (Floating Action Button)**
- 크기: 56x56px
- 배경: `#2563EB`
- 아이콘: `#FFFFFF`, 24px
- 그림자: 0 4px 12px rgba(37, 99, 235, 0.3)
- 모서리 반경: 16px
- 위치: 우하단, right 24px, bottom SafeArea + 24px

### 4.2 카드

- 배경: `#FFFFFF`
- 테두리: 1px `#E2E8F0`
- 모서리 반경: 12px
- 내부 패딩: 16px
- 그림자: 0 1px 3px rgba(0, 0, 0, 0.06)
- Pressed: 배경 `#F8FAFC`

### 4.3 입력 (드롭다운/셀렉트)

- 높이: 48px
- 배경: `#F8FAFC`
- 테두리: 1.5px `#E2E8F0`
- 모서리 반경: 10px
- 내부 좌우 패딩: 16px
- 텍스트: Body, `#0F172A`
- 플레이스홀더: Body, `#94A3B8`
- Focus 테두리: `#2563EB`
- 우측: 화살표 아이콘 20px, `#64748B`

### 4.4 모달 (언어 선택 바텀시트)

- 배경: `#FFFFFF`
- 모서리 반경: 상단 20px
- 핸들바: 40x4px, `#CBD5E1`, 중앙 상단 12px
- 내부 패딩: 24px
- 오버레이: `#000000` opacity 0.4
- 리스트 항목 높이: 52px (터치 영역 확보)
- 선택된 항목: 배경 `#EFF6FF`, 텍스트 `#2563EB`, 우측 체크 아이콘

### 4.5 프로그레스 바

- 트랙 높이: 8px
- 트랙 배경: `#E2E8F0`
- 채움 배경: `#2563EB`
- 모서리 반경: 4px (양끝 라운드)
- 애니메이션: 채움 전환 300ms ease-out

### 4.6 상태 배지

| 상태 | 배경 | 텍스트 |
|------|------|--------|
| 완료 | `#F0FDF4` | `#22C55E` |
| 처리중 | `#FFF7ED` | `#F59E0B` |
| 실패 | `#FEF2F2` | `#EF4444` |

- 패딩: 4px 10px
- 모서리 반경: 6px
- 텍스트: Caption Bold

### 4.7 영상 플레이어

- 비율: 16:9
- 모서리 반경: 12px (독립 배치 시)
- 재생 버튼 오버레이: 56x56px, 중앙, 반투명 배경
- 시크바 높이: 4px (비활성), 터치 영역 44px
- 시크바 색상: 재생 완료 `#2563EB`, 남은 `#E2E8F0`

### 4.8 탭 전환 (원본/더빙)

- 컨테이너 배경: `#F1F5F9`
- 모서리 반경: 10px
- 내부 패딩: 4px
- 탭 높이: 40px
- 활성 탭: 배경 `#FFFFFF`, 텍스트 `#0F172A`, 그림자 0 1px 2px rgba(0,0,0,0.06)
- 비활성 탭: 배경 투명, 텍스트 `#64748B`

---

## 5. 네비게이션 구조

### 5.1 전체 구조: Stack 기반

인증 여부에 따라 두 개의 스택 그룹으로 분기한다.

```
RootLayout
├── (auth)                    -- 미인증 그룹
│   └── login                 -- 온보딩/로그인
│
└── (app)                     -- 인증 그룹
    ├── (tabs)                -- 탭 네비게이션 (확장 가능)
    │   └── index             -- 홈 (더빙 이력)
    │
    ├── upload                -- 영상 업로드
    ├── settings              -- 더빙 설정 (언어 선택)
    ├── progress              -- 더빙 진행
    └── result/[id]           -- 결과 확인
```

### 5.2 화면 전환 흐름도

```
[login] ---(Google 인증 성공)---> [index]
[index] ---(FAB 탭)-----------> [upload]
[index] ---(이력 항목 탭)------> [result/[id]]
[upload] --(영상 선택 후)------> [settings]
[settings] -(더빙 시작)--------> [progress]
[progress] -(완료)-------------> [result/[id]]
[result] ---(새 더빙)----------> [upload]
[result] ---(뒤로)-------------> [index]
```

### 5.3 전환 애니메이션

- Stack push: 우측에서 슬라이드 인 (기본 네이티브 전환)
- Stack pop: 좌측으로 슬라이드 아웃
- 모달 (언어 선택): 하단에서 슬라이드 업

---

## 6. Expo Router 파일 구조 제안

```
app/
├── _layout.tsx               -- RootLayout: 인증 상태 분기
│
├── (auth)/
│   ├── _layout.tsx           -- Auth 스택 레이아웃
│   └── login.tsx             -- 온보딩/로그인 화면
│
├── (app)/
│   ├── _layout.tsx           -- App 스택 레이아웃 (인증 필요)
│   │
│   ├── (tabs)/
│   │   ├── _layout.tsx       -- 탭 레이아웃 (현재 탭 1개, 확장 가능)
│   │   └── index.tsx         -- 홈: 더빙 이력 목록
│   │
│   ├── upload.tsx            -- 영상 업로드
│   ├── settings.tsx          -- 더빙 설정 (언어 선택)
│   ├── progress.tsx          -- 더빙 진행 상태
│   └── result/
│       └── [id].tsx          -- 결과 확인 (동적 라우트)
│
components/
├── ui/
│   ├── Button.tsx            -- Primary/Secondary 버튼
│   ├── Card.tsx              -- 더빙 이력 카드
│   ├── ProgressBar.tsx       -- 프로그레스 바
│   ├── Badge.tsx             -- 상태 배지
│   ├── BottomSheet.tsx       -- 바텀시트 모달
│   └── VideoPlayer.tsx       -- 영상 플레이어
├── DubbingListItem.tsx       -- 더빙 이력 리스트 항목
├── LanguageSelector.tsx      -- 언어 선택 드롭다운
├── VideoPreview.tsx          -- 영상 미리보기
└── EmptyState.tsx            -- 빈 상태 컴포넌트

constants/
├── colors.ts                 -- 색상 팔레트 상수
├── typography.ts             -- 타이포그래피 스타일
└── spacing.ts                -- 간격 토큰

lib/
├── supabase.ts               -- Supabase 클라이언트 초기화
└── auth.ts                   -- 인증 유틸리티

hooks/
├── useAuth.ts                -- 인증 상태 훅
└── useDubbing.ts             -- 더빙 작업 관련 훅

types/
└── index.ts                  -- 공통 타입 정의
```

---

## 7. 접근성 가이드라인

- 모든 인터랙티브 요소에 `accessibilityLabel` 적용
- 색상 대비: WCAG AA 기준 4.5:1 이상
- 터치 타겟: 최소 44x44pt
- 포커스 순서: 논리적 탭 순서 보장
- 로딩 상태: `accessibilityLiveRegion`으로 상태 변화 알림

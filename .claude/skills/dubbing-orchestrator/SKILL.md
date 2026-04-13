---
name: dubbing-orchestrator
description: "모바일 더빙 앱의 에이전트 팀을 조율하는 오케스트레이터. 디자인, 프론트엔드, 백엔드, QA 에이전트를 파이프라인으로 조율하여 와이어프레임부터 배포까지 전체 개발을 수행한다. '더빙 앱 개발', '앱 만들어줘', '개발 시작', '프로젝트 시작' 요청 시 사용. 후속 작업: 결과 수정, 부분 재실행, 업데이트, 보완, 다시 실행, 이전 결과 개선, 특정 화면만 다시, 백엔드만 수정 요청 시에도 반드시 이 스킬을 사용."
---

# Dubbing App Orchestrator

모바일 더빙 앱의 에이전트 팀을 조율하여 와이어프레임부터 배포 가능한 앱까지 생성하는 통합 스킬.

## 실행 모드: 에이전트 팀 (파이프라인 패턴)

## 에이전트 구성

| 팀원 | 에이전트 타입 | 역할 | 스킬 | 출력 |
|------|-------------|------|------|------|
| designer | general-purpose | UI/UX 설계 | dubbing-design | 와이어프레임 + 디자인 스펙 |
| frontend | general-purpose | Expo 앱 구현 | dubbing-frontend | 앱 소스코드 + API 계약서 |
| backend | general-purpose | FastAPI 서버 구현 | dubbing-backend | 서버 소스코드 + API 스펙 |
| qa | general-purpose | 통합 정합성 검증 | dubbing-qa | QA 보고서 |

## 워크플로우

### Phase 0: 컨텍스트 확인

기존 산출물 존재 여부를 확인하여 실행 모드를 결정한다:

1. `_workspace/` 디렉토리 존재 여부 확인
2. 실행 모드 결정:
   - **`_workspace/` 미존재** → 초기 실행. Phase 1로 진행
   - **`_workspace/` 존재 + 사용자가 부분 수정 요청** → 부분 재실행. 해당 에이전트만 재호출
   - **`_workspace/` 존재 + 새 입력 제공** → 새 실행. 기존 `_workspace/`를 `_workspace_{timestamp}/`로 이동

### Phase 1: 준비

1. 사용자 입력 분석 — 요구하는 기능, 화면, 우선순위 파악
2. `_workspace/` 디렉토리 생성
3. 요구사항을 `_workspace/00_input/requirements.md`에 정리

### Phase 2: 팀 구성

1. 팀 생성:
   ```
   TeamCreate(
     team_name: "dubbing-team",
     members: [
       { name: "designer", agent_type: "general-purpose", model: "opus",
         prompt: ".claude/agents/designer.md를 읽고 역할을 수행하라. .claude/skills/design/SKILL.md를 참조하라." },
       { name: "frontend", agent_type: "general-purpose", model: "opus",
         prompt: ".claude/agents/frontend.md를 읽고 역할을 수행하라. .claude/skills/frontend/SKILL.md를 참조하라." },
       { name: "backend", agent_type: "general-purpose", model: "opus",
         prompt: ".claude/agents/backend.md를 읽고 역할을 수행하라. .claude/skills/backend/SKILL.md를 참조하라." },
       { name: "qa", agent_type: "general-purpose", model: "opus",
         prompt: ".claude/agents/qa.md를 읽고 역할을 수행하라. .claude/skills/qa/SKILL.md를 참조하라." }
     ]
   )
   ```

2. 작업 등록 (파이프라인 의존성 반영):
   ```
   TaskCreate(tasks: [
     { title: "와이어프레임 작성", assignee: "designer" },
     { title: "디자인 스펙 작성", assignee: "designer" },
     { title: "프론트엔드 구현", assignee: "frontend", depends_on: ["디자인 스펙 작성"] },
     { title: "API 계약서 작성", assignee: "frontend", depends_on: ["프론트엔드 구현"] },
     { title: "백엔드 구현", assignee: "backend", depends_on: ["API 계약서 작성"] },
     { title: "API 스펙 문서 작성", assignee: "backend", depends_on: ["백엔드 구현"] },
     { title: "디자인-프론트 정합성 검증", assignee: "qa", depends_on: ["프론트엔드 구현"] },
     { title: "프론트-백엔드 통합 검증", assignee: "qa", depends_on: ["API 스펙 문서 작성"] },
     { title: "최종 통합 검증", assignee: "qa", depends_on: ["프론트-백엔드 통합 검증"] }
   ])
   ```

### Phase 3: 디자인 (designer)

1. designer가 와이어프레임과 디자인 스펙을 작성
2. 완료 시 frontend에게 SendMessage로 알림
3. **QA 점검**: qa가 디자인 스펙의 완성도를 간단히 확인

### Phase 4: 프론트엔드 구현 (frontend)

1. frontend가 디자인 스펙을 기반으로 Expo 앱 구현
2. API 계약서(`_workspace/02_frontend_api_contract.md`) 작성
3. 완료 시 backend에게 API 계약서 공유 (SendMessage)
4. **QA 점검**: qa가 디자인-프론트 정합성 검증 (화면 구조, 네비게이션 경로)

### Phase 5: 백엔드 구현 (backend)

1. backend가 API 계약서를 기반으로 FastAPI 서버 구현
2. API 스펙 문서(`_workspace/03_backend_api_spec.md`) 작성
3. frontend와 API 형식 불일치 시 SendMessage로 직접 협의
4. **QA 점검**: qa가 프론트-백엔드 통합 검증 (타입 정합성, 경로 일치, 인증 흐름)

### Phase 6: 최종 검증 (qa)

1. qa가 전체 통합 검증 수행
2. 버그 발견 시 해당 에이전트에게 SendMessage로 수정 요청
3. 수정 후 재검증
4. 최종 QA 보고서(`_workspace/04_qa_report.md`) 작성

### Phase 7: 정리

1. 리더가 모든 산출물 확인
2. 팀원 종료 요청
3. 팀 정리
4. `_workspace/` 보존
5. 사용자에게 완료 보고 및 결과 요약

## 데이터 전달 프로토콜

| 출발 | 도착 | 방식 | 내용 |
|------|------|------|------|
| designer → frontend | 파일 기반 | `_workspace/01_design_*.md` |
| frontend → backend | 파일 기반 + 메시지 | `_workspace/02_frontend_api_contract.md` |
| backend → qa | 파일 기반 | `_workspace/03_backend_api_spec.md` |
| qa → frontend/backend | 메시지 기반 | 버그 리포트 (SendMessage) |
| 모든 팀원 → 리더 | 태스크 기반 | TaskUpdate로 진행률 보고 |

## 에러 핸들링

- 에이전트가 작업 실패 시: 1회 재시도. 재실패 시 해당 단계 건너뛰고 보고서에 누락 명시.
- 프론트-백엔드 API 불일치 시: 두 에이전트가 SendMessage로 직접 협의. 합의 안 되면 리더가 판단.
- QA에서 Critical 버그 발견 시: 해당 에이전트에게 즉시 수정 요청. 수정 후 재검증.

## 테스트 시나리오

### 정상 흐름
1. "더빙 앱 개발 시작해줘" → 오케스트레이터 트리거
2. Phase 1~7 순차 실행
3. 최종 산출물: `app/`, `server/`, `_workspace/04_qa_report.md`

### 에러 흐름
1. QA에서 API 타입 불일치 발견
2. qa → backend에게 수정 요청 (SendMessage)
3. backend 수정 후 qa 재검증
4. PASS 시 Phase 7로 진행

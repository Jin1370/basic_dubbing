#!/usr/bin/env bash
# .ralph/run.sh
set -u

# ---------- 설정 ----------
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RALPH_DIR="$PROJECT_DIR/.ralph"
LOG_DIR="$RALPH_DIR/logs"
JOURNAL_DIR="$RALPH_DIR/JOURNAL"

MAX_ITERATIONS="${MAX_ITERATIONS:-300}"
STALL_TIMEOUT="${STALL_TIMEOUT:-900}"
COOLDOWN="${COOLDOWN:-5}"
BRANCH_PREFIX="${BRANCH_PREFIX:-ralph}"

mkdir -p "$LOG_DIR" "$JOURNAL_DIR"
cd "$PROJECT_DIR" || exit 1

# ---------- 전용 브랜치 ----------
BRANCH="${BRANCH_PREFIX}/$(date +%Y%m%d-%H%M%S)"
git fetch --all --quiet || true
git checkout -B "$BRANCH" || { echo "branch create failed"; exit 1; }

echo "[$(date)] Ralph harness start on branch $BRANCH" | tee -a "$LOG_DIR/harness.log"

# ---------- 메인 루프 ----------
iteration=0
while (( iteration < MAX_ITERATIONS )); do
  iteration=$((iteration + 1))
  ts="$(date +%Y%m%d-%H%M%S)"
  log_file="$LOG_DIR/loop-${ts}-iter${iteration}.log"

  # heartbeat 갱신
  touch "$RALPH_DIR/heartbeat"

  echo "=== iter $iteration @ $ts ===" | tee -a "$log_file"

  # Claude 실행 — 무개입 모드
  timeout --signal=SIGTERM "$STALL_TIMEOUT" \
    claude -p \
      --dangerously-skip-permissions \
      --output-format stream-json \
      --verbose \
      < "$RALPH_DIR/PROMPT.md" \
      >> "$log_file" 2>&1

  exit_code=$?

  # 변경사항 있으면 자동 커밋
  if ! git diff --quiet || ! git diff --cached --quiet; then
    git add -A
    git commit -m "ralph: iter ${iteration} @ ${ts} (exit=${exit_code})" \
      --no-verify || true
  else
    echo "[iter $iteration] no changes" >> "$log_file"
  fi

  # 스톨 기록
  if [ "$exit_code" = "124" ] || [ "$exit_code" = "137" ]; then
    {
      echo "## iter ${iteration} @ ${ts}"
      echo "- exit=${exit_code} (timeout ${STALL_TIMEOUT}s)"
      echo "- log=${log_file}"
      echo ""
    } >> "$JOURNAL_DIR/stalls.md"
  fi

  sleep "$COOLDOWN"
done

echo "[$(date)] Ralph harness reached MAX_ITERATIONS=$MAX_ITERATIONS" \
  | tee -a "$LOG_DIR/harness.log"

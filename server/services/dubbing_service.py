"""
더빙 비즈니스 로직.
작업 생성, 상태 관리, 결과 처리를 담당한다.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from server.models.database import (
    DUBBED_VIDEO_PREFIX,
    ORIGINAL_VIDEO_PREFIX,
    STORAGE_BUCKET,
    TABLE_DUBBING_JOBS,
)
from server.models.schemas import (
    CreateDubbingRequest,
    CreateDubbingResponse,
    DubbingDetail,
    DubbingItem,
    DubbingProgress,
    DubbingStatus,
    DubbingStep,
    StepProgress,
    StepStatus,
)
from server.services.perso_ai import get_perso_ai_client
from server.services.supabase_client import get_signed_url, get_supabase_client


# ---------- 더빙 단계 순서 ----------
STEP_ORDER: list[DubbingStep] = [
    DubbingStep.upload,
    DubbingStep.extract_audio,
    DubbingStep.analyze_speech,
    DubbingStep.synthesize_dubbing,
]


def _build_steps(current_step: DubbingStep, status: DubbingStatus) -> list[StepProgress]:
    """현재 단계 기준으로 steps 배열을 생성한다."""
    if status == DubbingStatus.completed:
        return [StepProgress(step=s, status=StepStatus.done) for s in STEP_ORDER]
    if status == DubbingStatus.failed:
        steps = []
        for s in STEP_ORDER:
            if s.value == current_step.value:
                steps.append(StepProgress(step=s, status=StepStatus.in_progress))
            elif STEP_ORDER.index(s) < STEP_ORDER.index(current_step):
                steps.append(StepProgress(step=s, status=StepStatus.done))
            else:
                steps.append(StepProgress(step=s, status=StepStatus.pending))
        return steps

    steps = []
    current_idx = STEP_ORDER.index(current_step)
    for i, s in enumerate(STEP_ORDER):
        if i < current_idx:
            steps.append(StepProgress(step=s, status=StepStatus.done))
        elif i == current_idx:
            steps.append(StepProgress(step=s, status=StepStatus.in_progress))
        else:
            steps.append(StepProgress(step=s, status=StepStatus.pending))
    return steps


# ---------- 작업 목록 ----------

async def list_dubbing_jobs(user_id: str) -> list[DubbingItem]:
    """사용자의 더빙 이력을 최신순으로 반환한다."""
    client = get_supabase_client()
    result = (
        client.table(TABLE_DUBBING_JOBS)
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    items = []
    for row in result.data:
        items.append(DubbingItem(
            id=row["id"],
            title=row["title"],
            thumbnail_url=row.get("thumbnail_url"),
            source_language=row["source_language"],
            target_language=row["target_language"],
            status=row["status"],
            created_at=row["created_at"],
            file_size_bytes=row.get("file_size_bytes", 0),
            duration_seconds=row.get("duration_seconds", 0),
        ))
    return items


# ---------- 작업 생성 ----------

async def create_dubbing_job(
    user_id: str,
    req: CreateDubbingRequest,
) -> CreateDubbingResponse:
    """
    새 더빙 작업을 생성한다.
    1. DB에 작업 레코드 삽입 (status=processing)
    2. Perso AI에 작업 요청
    3. perso_ai_job_id를 DB에 업데이트
    """
    client = get_supabase_client()

    # storage URI에서 실제 다운로드 URL 생성
    storage_path = req.video_uri.replace(f"storage://{STORAGE_BUCKET}/", "")
    original_video_url = get_signed_url(STORAGE_BUCKET, storage_path, expires_in=7200)

    # DB에 작업 생성
    insert_data = {
        "user_id": user_id,
        "title": req.file_name,
        "source_language": req.source_language.value,
        "target_language": req.target_language.value,
        "status": DubbingStatus.processing.value,
        "current_step": DubbingStep.upload.value,
        "progress_percent": 0,
        "video_uri": req.video_uri,
        "original_video_url": original_video_url,
    }
    result = client.table(TABLE_DUBBING_JOBS).insert(insert_data).execute()
    job = result.data[0]
    job_id = job["id"]

    # Perso AI에 더빙 요청 (비동기, 에러 시에도 작업은 생성된 상태 유지)
    try:
        perso_client = get_perso_ai_client()
        perso_job_id = await perso_client.create_dubbing_job(
            video_url=original_video_url,
            source_language=req.source_language.value,
            target_language=req.target_language.value,
        )
        client.table(TABLE_DUBBING_JOBS).update({
            "perso_ai_job_id": perso_job_id,
            "current_step": DubbingStep.extract_audio.value,
            "progress_percent": 10,
        }).eq("id", job_id).execute()
    except Exception:
        # Perso AI 요청 실패 시 작업을 failed로 변경
        client.table(TABLE_DUBBING_JOBS).update({
            "status": DubbingStatus.failed.value,
        }).eq("id", job_id).execute()

    return CreateDubbingResponse(
        id=job_id,
        status=DubbingStatus.processing,
    )


# ---------- 작업 상세 ----------

async def get_dubbing_detail(user_id: str, job_id: str) -> Optional[DubbingDetail]:
    """더빙 작업의 상세 정보를 반환한다."""
    client = get_supabase_client()
    result = (
        client.table(TABLE_DUBBING_JOBS)
        .select("*")
        .eq("id", job_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        return None

    row = result.data[0]
    return DubbingDetail(
        id=row["id"],
        title=row["title"],
        thumbnail_url=row.get("thumbnail_url"),
        source_language=row["source_language"],
        target_language=row["target_language"],
        status=row["status"],
        created_at=row["created_at"],
        file_size_bytes=row.get("file_size_bytes", 0),
        duration_seconds=row.get("duration_seconds", 0),
        original_video_url=row.get("original_video_url", ""),
        dubbed_video_url=row.get("dubbed_video_url"),
        completed_at=row.get("completed_at"),
    )


# ---------- 작업 상태 ----------

async def get_dubbing_status(user_id: str, job_id: str) -> Optional[DubbingProgress]:
    """
    더빙 작업의 진행 상태를 반환한다.
    Perso AI에서 최신 상태를 가져와 DB를 업데이트한 후 반환한다.
    """
    client = get_supabase_client()
    result = (
        client.table(TABLE_DUBBING_JOBS)
        .select("*")
        .eq("id", job_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        return None

    row = result.data[0]
    perso_job_id = row.get("perso_ai_job_id")

    # Perso AI 작업이 있으면 최신 상태 동기화
    if perso_job_id and row["status"] == DubbingStatus.processing.value:
        try:
            perso_client = get_perso_ai_client()
            perso_result = await perso_client.get_job_status(perso_job_id)

            update_data: dict = {
                "progress_percent": perso_result.progress_percent,
                "estimated_remaining_seconds": perso_result.estimated_remaining_seconds,
            }

            if perso_result.current_step:
                update_data["current_step"] = perso_result.current_step

            if perso_result.status == "completed":
                update_data["status"] = DubbingStatus.completed.value
                update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
                if perso_result.dubbed_video_url:
                    update_data["dubbed_video_url"] = perso_result.dubbed_video_url
                update_data["progress_percent"] = 100
            elif perso_result.status == "failed":
                update_data["status"] = DubbingStatus.failed.value

            client.table(TABLE_DUBBING_JOBS).update(update_data).eq("id", job_id).execute()

            # 업데이트된 데이터 반영
            row.update(update_data)
        except Exception:
            # Perso AI 조회 실패 시 DB에 있는 상태를 그대로 반환
            pass

    current_step = DubbingStep(row.get("current_step", "upload"))
    status = DubbingStatus(row["status"])

    return DubbingProgress(
        id=row["id"],
        status=status,
        current_step=current_step,
        progress_percent=row.get("progress_percent", 0),
        estimated_remaining_seconds=row.get("estimated_remaining_seconds"),
        steps=_build_steps(current_step, status),
    )


# ---------- 다운로드 URL ----------

async def get_download_url(user_id: str, job_id: str) -> Optional[str]:
    """더빙 완료된 영상의 다운로드 URL을 반환한다."""
    client = get_supabase_client()
    result = (
        client.table(TABLE_DUBBING_JOBS)
        .select("status, dubbed_video_url")
        .eq("id", job_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        return None

    row = result.data[0]
    if row["status"] != DubbingStatus.completed.value or not row.get("dubbed_video_url"):
        return None

    return row["dubbed_video_url"]

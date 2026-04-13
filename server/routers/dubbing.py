"""
더빙 작업 라우터.
GET  /api/dubbing            — 이력 목록
POST /api/dubbing            — 작업 생성
GET  /api/dubbing/{id}       — 상세
GET  /api/dubbing/{id}/status — 진행 상태
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from server.middleware.auth import get_user_id
from server.models.schemas import (
    CreateDubbingRequest,
    CreateDubbingResponse,
    DubbingDetail,
    DubbingItem,
    DubbingProgress,
    ErrorResponse,
)
from server.services.dubbing_service import (
    create_dubbing_job,
    get_dubbing_detail,
    get_dubbing_status,
    list_dubbing_jobs,
)

router = APIRouter(prefix="/api/dubbing", tags=["dubbing"])


@router.get(
    "",
    response_model=list[DubbingItem],
    responses={401: {"model": ErrorResponse}},
)
async def get_dubbing_list(user_id: str = Depends(get_user_id)):
    """로그인 사용자의 더빙 이력 목록을 최신순으로 반환한다."""
    return await list_dubbing_jobs(user_id)


@router.post(
    "",
    response_model=CreateDubbingResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
    },
)
async def create_dubbing(
    req: CreateDubbingRequest,
    user_id: str = Depends(get_user_id),
):
    """
    새 더빙 작업을 생성한다.
    즉시 작업 ID와 processing 상태를 반환한다.
    """
    if req.source_language == req.target_language:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="원본 언어와 대상 언어가 동일합니다.",
        )
    return await create_dubbing_job(user_id, req)


@router.get(
    "/{job_id}",
    response_model=DubbingDetail,
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    },
)
async def get_dubbing_job_detail(
    job_id: str,
    user_id: str = Depends(get_user_id),
):
    """더빙 작업의 상세 정보를 반환한다."""
    detail = await get_dubbing_detail(user_id, job_id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="더빙 작업을 찾을 수 없습니다.",
        )
    return detail


@router.get(
    "/{job_id}/status",
    response_model=DubbingProgress,
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    },
)
async def get_dubbing_job_status(
    job_id: str,
    user_id: str = Depends(get_user_id),
):
    """더빙 작업의 진행 상태를 반환한다. 프론트에서 3초 간격으로 폴링한다."""
    progress = await get_dubbing_status(user_id, job_id)
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="더빙 작업을 찾을 수 없습니다.",
        )
    return progress

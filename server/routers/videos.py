"""
영상 업로드/다운로드 라우터.
POST /api/upload              — 영상 업로드
GET  /api/dubbing/{id}/download — 더빙 영상 다운로드 URL
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status

from server.middleware.auth import get_user_id
from server.models.database import ORIGINAL_VIDEO_PREFIX, STORAGE_BUCKET
from server.models.schemas import DownloadResponse, ErrorResponse, UploadResponse
from server.services.dubbing_service import get_download_url
from server.services.supabase_client import upload_to_storage

router = APIRouter(prefix="/api", tags=["videos"])

# 최대 파일 크기: 500MB
MAX_FILE_SIZE = 500 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"video/mp4", "video/quicktime", "video/mov"}
ALLOWED_EXTENSIONS = {".mp4", ".mov"}


@router.post(
    "/upload",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
    },
)
async def upload_video(
    file: UploadFile,
    user_id: str = Depends(get_user_id),
):
    """
    영상 파일을 Supabase Storage에 업로드하고 storage URI를 반환한다.
    지원 형식: MP4, MOV. 최대 500MB.
    """
    # 파일 형식 검증
    filename = file.filename or "video.mp4"
    ext = ""
    if "." in filename:
        ext = "." + filename.rsplit(".", 1)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="지원하지 않는 파일 형식입니다. MP4 또는 MOV만 가능합니다.",
        )

    # 파일 읽기
    file_data = await file.read()

    # 파일 크기 검증
    if len(file_data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="파일 크기가 500MB를 초과합니다.",
        )

    # Storage에 업로드
    unique_name = f"{uuid.uuid4().hex}{ext}"
    storage_path = f"{ORIGINAL_VIDEO_PREFIX}/{user_id}/{unique_name}"

    content_type = file.content_type or "video/mp4"
    video_uri = upload_to_storage(
        bucket=STORAGE_BUCKET,
        path=storage_path,
        file_data=file_data,
        content_type=content_type,
    )

    return UploadResponse(video_uri=video_uri)


@router.get(
    "/dubbing/{job_id}/download",
    response_model=DownloadResponse,
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    },
)
async def download_dubbed_video(
    job_id: str,
    user_id: str = Depends(get_user_id),
):
    """더빙 완료된 영상의 다운로드 URL을 반환한다."""
    url = await get_download_url(user_id, job_id)
    if not url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="아직 더빙이 완료되지 않았거나 작업을 찾을 수 없습니다.",
        )
    return DownloadResponse(url=url)

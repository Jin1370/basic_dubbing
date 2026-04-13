"""
Pydantic 요청/응답 모델.
프론트엔드 lib/types.ts의 타입과 일치시킨다.
snake_case 필드명 사용 (프론트엔드 계약서가 snake_case).
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ---------- Enums ----------

class LanguageCode(str, Enum):
    ko = "ko"
    en = "en"
    ja = "ja"
    zh = "zh"
    es = "es"


class DubbingStatus(str, Enum):
    uploading = "uploading"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class DubbingStep(str, Enum):
    upload = "upload"
    extract_audio = "extract_audio"
    analyze_speech = "analyze_speech"
    synthesize_dubbing = "synthesize_dubbing"


class StepStatus(str, Enum):
    done = "done"
    in_progress = "in_progress"
    pending = "pending"


# ---------- User ----------

class UserProfile(BaseModel):
    id: str
    email: str
    display_name: str
    avatar_url: Optional[str] = None


# ---------- Upload ----------

class UploadResponse(BaseModel):
    video_uri: str


# ---------- Dubbing: 요청 ----------

class CreateDubbingRequest(BaseModel):
    video_uri: str
    file_name: str
    source_language: LanguageCode
    target_language: LanguageCode


# ---------- Dubbing: 응답 ----------

class CreateDubbingResponse(BaseModel):
    id: str
    status: DubbingStatus


class DubbingItem(BaseModel):
    id: str
    title: str
    thumbnail_url: Optional[str] = None
    source_language: LanguageCode
    target_language: LanguageCode
    status: DubbingStatus
    created_at: str  # ISO 8601
    file_size_bytes: int
    duration_seconds: int


class DubbingDetail(DubbingItem):
    original_video_url: str
    dubbed_video_url: Optional[str] = None
    completed_at: Optional[str] = None  # ISO 8601


class StepProgress(BaseModel):
    step: DubbingStep
    status: StepStatus


class DubbingProgress(BaseModel):
    id: str
    status: DubbingStatus
    current_step: DubbingStep
    progress_percent: int
    estimated_remaining_seconds: Optional[int] = None
    steps: list[StepProgress]


class DownloadResponse(BaseModel):
    url: str


# ---------- Auth ----------

class GoogleAuthRequest(BaseModel):
    id_token: str


class AuthTokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: UserProfile


# ---------- Error ----------

class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None

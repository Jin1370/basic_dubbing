"""
Perso AI API 클라이언트.
실제 Perso AI API 엔드포인트는 공개되지 않았으므로,
합리적인 인터페이스를 설계하고 실제 연동 시 조정 가능하도록 추상화한다.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Optional

import httpx
from dotenv import load_dotenv

load_dotenv()


@dataclass
class PersoAIJobResult:
    """Perso AI API에서 반환하는 더빙 작업 결과."""
    job_id: str
    status: str  # "pending" | "processing" | "completed" | "failed"
    progress_percent: int
    current_step: Optional[str] = None
    estimated_remaining_seconds: Optional[int] = None
    dubbed_video_url: Optional[str] = None
    error_message: Optional[str] = None


class PersoAIClient:
    """Perso AI API와 통신하는 비동기 클라이언트."""

    def __init__(self) -> None:
        self.base_url = os.environ.get("PERSO_AI_API_URL", "https://api.perso.ai")
        self.api_key = os.environ.get("PERSO_AI_API_KEY", "")
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                timeout=httpx.Timeout(60.0),
            )
        return self._client

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    # ---------- API 메서드 ----------

    async def create_dubbing_job(
        self,
        video_url: str,
        source_language: str,
        target_language: str,
    ) -> str:
        """
        Perso AI에 더빙 작업을 생성한다.
        반환: Perso AI 내부 job_id
        """
        client = await self._get_client()
        response = await client.post(
            "/v1/dubbing/jobs",
            json={
                "video_url": video_url,
                "source_language": source_language,
                "target_language": target_language,
            },
        )
        response.raise_for_status()
        data = response.json()
        return data["job_id"]

    async def get_job_status(self, job_id: str) -> PersoAIJobResult:
        """Perso AI 더빙 작업의 현재 상태를 조회한다."""
        client = await self._get_client()
        response = await client.get(f"/v1/dubbing/jobs/{job_id}")
        response.raise_for_status()
        data = response.json()
        return PersoAIJobResult(
            job_id=data.get("job_id", job_id),
            status=data.get("status", "pending"),
            progress_percent=data.get("progress_percent", 0),
            current_step=data.get("current_step"),
            estimated_remaining_seconds=data.get("estimated_remaining_seconds"),
            dubbed_video_url=data.get("dubbed_video_url"),
            error_message=data.get("error_message"),
        )

    async def get_dubbed_video_url(self, job_id: str) -> Optional[str]:
        """완료된 더빙 작업의 결과 영상 URL을 반환한다."""
        result = await self.get_job_status(job_id)
        if result.status == "completed" and result.dubbed_video_url:
            return result.dubbed_video_url
        return None


# 싱글턴 인스턴스
_perso_client: Optional[PersoAIClient] = None


def get_perso_ai_client() -> PersoAIClient:
    global _perso_client
    if _perso_client is None:
        _perso_client = PersoAIClient()
    return _perso_client

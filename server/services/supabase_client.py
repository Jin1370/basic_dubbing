"""
Supabase 클라이언트 초기화 및 헬퍼.
DB, Storage, Auth 검증 기능을 제공한다.
"""

from __future__ import annotations

import os
from functools import lru_cache

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()


@lru_cache()
def get_supabase_client() -> Client:
    """서비스 역할 키로 Supabase 클라이언트를 생성한다 (서버 사이드 전용)."""
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    return create_client(url, key)


def get_supabase_anon_client() -> Client:
    """Anon 키로 Supabase 클라이언트를 생성한다 (클라이언트 사이드 호환)."""
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_ANON_KEY"]
    return create_client(url, key)


# ---------- Storage 헬퍼 ----------

def upload_to_storage(
    bucket: str,
    path: str,
    file_data: bytes,
    content_type: str = "video/mp4",
) -> str:
    """
    Supabase Storage에 파일을 업로드하고 storage URI를 반환한다.
    반환: "storage://{bucket}/{path}"
    """
    client = get_supabase_client()
    client.storage.from_(bucket).upload(
        path,
        file_data,
        file_options={"content-type": content_type},
    )
    return f"storage://{bucket}/{path}"


def get_signed_url(bucket: str, path: str, expires_in: int = 3600) -> str:
    """Supabase Storage에서 서명된 다운로드 URL을 생성한다."""
    client = get_supabase_client()
    result = client.storage.from_(bucket).create_signed_url(path, expires_in)
    return result["signedURL"]


def get_public_url(bucket: str, path: str) -> str:
    """Supabase Storage의 공개 URL을 반환한다."""
    client = get_supabase_client()
    result = client.storage.from_(bucket).get_public_url(path)
    return result

"""
JWT 검증 미들웨어.
Supabase JWT 토큰의 유효성을 검증한다.
Authorization: Bearer {token} 형식.
"""

from __future__ import annotations

import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

load_dotenv()

_bearer_scheme = HTTPBearer()

JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")
JWT_ALGORITHM = "HS256"
JWT_AUDIENCE = "authenticated"


def _decode_token(token: str) -> dict:
    """Supabase JWT를 디코딩하고 검증한다."""
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            audience=JWT_AUDIENCE,
        )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 인증 토큰입니다.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
) -> dict:
    """
    현재 인증된 사용자 정보를 반환한다.
    FastAPI Depends로 사용: current_user = Depends(get_current_user)
    반환되는 dict에는 최소 "sub" (user_id), "email" 필드가 포함된다.
    """
    payload = _decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="토큰에 사용자 정보가 없습니다.",
        )
    return payload


def get_user_id(current_user: dict = Depends(get_current_user)) -> str:
    """현재 사용자의 ID(sub)를 반환하는 헬퍼 의존성."""
    return current_user["sub"]

"""
인증 라우터.
POST /api/auth/google — Google 토큰으로 Supabase Auth 로그인.
GET  /api/users/me   — 현재 사용자 프로필 반환.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from server.middleware.auth import get_current_user, get_user_id
from server.models.database import TABLE_USER_PROFILES
from server.models.schemas import (
    AuthTokenResponse,
    ErrorResponse,
    GoogleAuthRequest,
    UserProfile,
)
from server.services.supabase_client import get_supabase_client

router = APIRouter(prefix="/api", tags=["auth"])


@router.post(
    "/auth/google",
    response_model=AuthTokenResponse,
    status_code=status.HTTP_200_OK,
    responses={401: {"model": ErrorResponse}},
)
async def google_auth(req: GoogleAuthRequest):
    """
    Google ID 토큰으로 Supabase Auth 로그인을 수행한다.
    Supabase가 Google 토큰을 검증하고 세션을 생성한다.
    """
    try:
        client = get_supabase_client()
        result = client.auth.sign_in_with_id_token({
            "provider": "google",
            "token": req.id_token,
        })

        user = result.user
        session = result.session

        if not user or not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google 인증에 실패했습니다.",
            )

        # user_profiles 테이블에 upsert
        profile_data = {
            "id": user.id,
            "email": user.email or "",
            "display_name": user.user_metadata.get("full_name", user.email or ""),
            "avatar_url": user.user_metadata.get("avatar_url"),
        }
        client.table(TABLE_USER_PROFILES).upsert(profile_data).execute()

        return AuthTokenResponse(
            access_token=session.access_token,
            refresh_token=session.refresh_token,
            user=UserProfile(
                id=user.id,
                email=user.email or "",
                display_name=profile_data["display_name"],
                avatar_url=profile_data["avatar_url"],
            ),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"인증 처리 중 오류가 발생했습니다: {str(e)}",
        )


@router.get(
    "/users/me",
    response_model=UserProfile,
    responses={401: {"model": ErrorResponse}},
)
async def get_me(
    current_user: dict = Depends(get_current_user),
    user_id: str = Depends(get_user_id),
):
    """현재 로그인한 사용자의 프로필을 반환한다."""
    client = get_supabase_client()
    result = (
        client.table(TABLE_USER_PROFILES)
        .select("*")
        .eq("id", user_id)
        .execute()
    )

    if result.data:
        row = result.data[0]
        return UserProfile(
            id=row["id"],
            email=row["email"],
            display_name=row["display_name"],
            avatar_url=row.get("avatar_url"),
        )

    # 프로필이 없으면 JWT 정보로 생성
    email = current_user.get("email", "")
    return UserProfile(
        id=user_id,
        email=email,
        display_name=email,
        avatar_url=None,
    )

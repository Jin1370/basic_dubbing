"""
FastAPI 앱 진입점.
CORS 설정, 라우터 마운트, 앱 수명 주기를 관리한다.
"""

from __future__ import annotations

import json
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from server.routers import auth, dubbing, videos
from server.services.perso_ai import get_perso_ai_client

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작/종료 시 리소스를 관리한다."""
    yield
    # 종료 시 Perso AI 클라이언트 정리
    perso_client = get_perso_ai_client()
    await perso_client.close()


app = FastAPI(
    title="Dubbing App API",
    description="Perso AI를 활용한 모바일 더빙 앱 백엔드",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------- CORS ----------
cors_origins_raw = os.environ.get("CORS_ORIGINS", '["*"]')
try:
    cors_origins = json.loads(cors_origins_raw)
except (json.JSONDecodeError, TypeError):
    cors_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- 라우터 마운트 ----------
app.include_router(auth.router)
app.include_router(dubbing.router)
app.include_router(videos.router)


# ---------- 글로벌 예외 핸들러 ----------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """처리되지 않은 예외를 표준 에러 형식으로 반환한다."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "서버 내부 오류가 발생했습니다.",
            "code": "INTERNAL_SERVER_ERROR",
        },
    )


# ---------- Health Check ----------
@app.get("/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8000"))
    debug = os.environ.get("DEBUG", "false").lower() == "true"
    uvicorn.run("server.main:app", host=host, port=port, reload=debug)

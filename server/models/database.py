"""
Supabase DB 테이블 스키마 정의.
실제 마이그레이션은 Supabase 대시보드 또는 SQL 파일로 수행한다.
여기서는 테이블 구조를 파이썬 딕셔너리/상수로 문서화한다.
"""

# ---------- 테이블: dubbing_jobs ----------
# Supabase에서 아래 SQL로 생성:
#
# CREATE TABLE dubbing_jobs (
#     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
#     user_id UUID NOT NULL REFERENCES auth.users(id),
#     title TEXT NOT NULL,
#     thumbnail_url TEXT,
#     source_language TEXT NOT NULL CHECK (source_language IN ('ko','en','ja','zh','es')),
#     target_language TEXT NOT NULL CHECK (target_language IN ('ko','en','ja','zh','es')),
#     status TEXT NOT NULL DEFAULT 'uploading'
#         CHECK (status IN ('uploading','processing','completed','failed')),
#     current_step TEXT DEFAULT 'upload'
#         CHECK (current_step IN ('upload','extract_audio','analyze_speech','synthesize_dubbing')),
#     progress_percent INT DEFAULT 0,
#     estimated_remaining_seconds INT,
#     video_uri TEXT NOT NULL,
#     original_video_url TEXT,
#     dubbed_video_url TEXT,
#     file_size_bytes BIGINT DEFAULT 0,
#     duration_seconds INT DEFAULT 0,
#     perso_ai_job_id TEXT,
#     created_at TIMESTAMPTZ DEFAULT now(),
#     completed_at TIMESTAMPTZ,
#     updated_at TIMESTAMPTZ DEFAULT now()
# );
#
# -- RLS 정책: 사용자 본인의 작업만 조회/수정 가능
# ALTER TABLE dubbing_jobs ENABLE ROW LEVEL SECURITY;
# CREATE POLICY "Users can view own jobs"
#     ON dubbing_jobs FOR SELECT USING (auth.uid() = user_id);
# CREATE POLICY "Users can insert own jobs"
#     ON dubbing_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
# CREATE POLICY "Users can update own jobs"
#     ON dubbing_jobs FOR UPDATE USING (auth.uid() = user_id);

TABLE_DUBBING_JOBS = "dubbing_jobs"

# ---------- 테이블: user_profiles ----------
# Supabase Auth의 auth.users를 기본으로 사용하되,
# 추가 프로필 정보가 필요하면 아래 테이블을 사용한다.
#
# CREATE TABLE user_profiles (
#     id UUID PRIMARY KEY REFERENCES auth.users(id),
#     email TEXT NOT NULL,
#     display_name TEXT NOT NULL DEFAULT '',
#     avatar_url TEXT,
#     created_at TIMESTAMPTZ DEFAULT now(),
#     updated_at TIMESTAMPTZ DEFAULT now()
# );
#
# ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
# CREATE POLICY "Users can view own profile"
#     ON user_profiles FOR SELECT USING (auth.uid() = id);
# CREATE POLICY "Users can update own profile"
#     ON user_profiles FOR UPDATE USING (auth.uid() = id);

TABLE_USER_PROFILES = "user_profiles"


# ---------- Supabase Storage 버킷/경로 ----------
STORAGE_BUCKET = "videos"
ORIGINAL_VIDEO_PREFIX = "original"   # videos/original/{user_id}/
DUBBED_VIDEO_PREFIX = "dubbed"       # videos/dubbed/{user_id}/

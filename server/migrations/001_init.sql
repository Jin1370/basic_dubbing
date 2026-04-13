-- ============================================================
-- 초기 Supabase 테이블 마이그레이션
-- Supabase SQL Editor에서 실행하거나 supabase db push로 적용
-- ============================================================

-- ---------- dubbing_jobs ----------

CREATE TABLE IF NOT EXISTS dubbing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    title TEXT NOT NULL,
    thumbnail_url TEXT,
    source_language TEXT NOT NULL CHECK (source_language IN ('ko','en','ja','zh','es')),
    target_language TEXT NOT NULL CHECK (target_language IN ('ko','en','ja','zh','es')),
    status TEXT NOT NULL DEFAULT 'uploading'
        CHECK (status IN ('uploading','processing','completed','failed')),
    current_step TEXT DEFAULT 'upload'
        CHECK (current_step IN ('upload','extract_audio','analyze_speech','synthesize_dubbing')),
    progress_percent INT DEFAULT 0,
    estimated_remaining_seconds INT,
    video_uri TEXT NOT NULL,
    original_video_url TEXT,
    dubbed_video_url TEXT,
    file_size_bytes BIGINT DEFAULT 0,
    duration_seconds INT DEFAULT 0,
    perso_ai_job_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 정책: 사용자 본인의 작업만 조회/수정 가능
ALTER TABLE dubbing_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs"
    ON dubbing_jobs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs"
    ON dubbing_jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
    ON dubbing_jobs FOR UPDATE
    USING (auth.uid() = user_id);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dubbing_jobs_updated_at
    BEFORE UPDATE ON dubbing_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ---------- user_profiles ----------

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    display_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE TRIGGER user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ---------- Supabase Storage 버킷 ----------
-- Supabase 대시보드에서 "videos" 버킷을 생성하고
-- 적절한 RLS 정책을 설정할 것.
-- 경로 규칙:
--   original/{user_id}/{filename}
--   dubbed/{user_id}/{filename}

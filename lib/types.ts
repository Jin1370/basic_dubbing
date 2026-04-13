// ============================================================
// 공유 TypeScript 타입 정의
// ============================================================

/** 지원 언어 코드 */
export type LanguageCode = 'ko' | 'en' | 'ja' | 'zh' | 'es';

/** 언어 코드 → 표시 이름 매핑 */
export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  ko: '한국어',
  en: '영어',
  ja: '일본어',
  zh: '중국어',
  es: '스페인어',
};

/** 더빙 작업 상태 */
export type DubbingStatus = 'uploading' | 'processing' | 'completed' | 'failed';

/** 더빙 진행 단계 */
export type DubbingStep =
  | 'upload'
  | 'extract_audio'
  | 'analyze_speech'
  | 'synthesize_dubbing';

export const DUBBING_STEP_LABELS: Record<DubbingStep, string> = {
  upload: '영상 업로드',
  extract_audio: '음성 추출',
  analyze_speech: '음성 분석',
  synthesize_dubbing: '더빙 합성',
};

export const DUBBING_STEPS_ORDER: DubbingStep[] = [
  'upload',
  'extract_audio',
  'analyze_speech',
  'synthesize_dubbing',
];

/** 더빙 이력 항목 (목록용) */
export interface DubbingItem {
  id: string;
  title: string;
  thumbnail_url: string | null;
  source_language: LanguageCode;
  target_language: LanguageCode;
  status: DubbingStatus;
  created_at: string; // ISO 8601
  file_size_bytes: number;
  duration_seconds: number;
}

/** 더빙 상세 (결과 화면용) */
export interface DubbingDetail extends DubbingItem {
  original_video_url: string;
  dubbed_video_url: string | null;
  completed_at: string | null;
}

/** 더빙 진행 상태 (폴링용) */
export interface DubbingProgress {
  id: string;
  status: DubbingStatus;
  current_step: DubbingStep;
  progress_percent: number;
  estimated_remaining_seconds: number | null;
  steps: {
    step: DubbingStep;
    status: 'done' | 'in_progress' | 'pending';
  }[];
}

/** 더빙 작업 생성 요청 */
export interface CreateDubbingRequest {
  video_uri: string;
  file_name: string;
  source_language: LanguageCode;
  target_language: LanguageCode;
}

/** 더빙 작업 생성 응답 */
export interface CreateDubbingResponse {
  id: string;
  status: DubbingStatus;
}

/** 사용자 프로필 */
export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
}

/** API 에러 응답 */
export interface ApiError {
  detail: string;
  code?: string;
}

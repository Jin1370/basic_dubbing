// ============================================================
// Axios 인스턴스 + API 함수
// ============================================================

import axios, { AxiosError } from 'axios';
import Constants from 'expo-constants';
import { getAccessToken, signOut } from './auth';
import type {
  ApiError,
  CreateDubbingRequest,
  CreateDubbingResponse,
  DubbingDetail,
  DubbingItem,
  DubbingProgress,
  UserProfile,
} from './types';

// --------------- Axios 인스턴스 ---------------

const BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl ?? 'http://localhost:8000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// 요청 인터셉터: JWT 자동 첨부
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 에러 변환
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      const status = error.response.status;
      const detail = error.response.data?.detail ?? '알 수 없는 오류가 발생했습니다.';

      if (status === 401) {
        // 인증 만료 → 자동 로그아웃 후 세션 리스너가 auth 그룹으로 리다이렉트
        signOut().catch(() => {});
        return Promise.reject(new Error('인증이 만료되었습니다. 다시 로그인해 주세요.'));
      }
      return Promise.reject(new Error(detail));
    }
    if (error.request) {
      return Promise.reject(new Error('서버에 연결할 수 없습니다. 네트워크를 확인해 주세요.'));
    }
    return Promise.reject(error);
  },
);

// --------------- API 함수 ---------------

/** 사용자 프로필 조회 */
export async function fetchProfile(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>('/users/me');
  return data;
}

/** 더빙 이력 목록 조회 */
export async function fetchDubbingList(): Promise<DubbingItem[]> {
  const { data } = await api.get<DubbingItem[]>('/dubbing');
  return data;
}

/** 더빙 상세 조회 */
export async function fetchDubbingDetail(id: string): Promise<DubbingDetail> {
  const { data } = await api.get<DubbingDetail>(`/dubbing/${id}`);
  return data;
}

/** 더빙 진행 상태 조회 (폴링용) */
export async function fetchDubbingProgress(id: string): Promise<DubbingProgress> {
  const { data } = await api.get<DubbingProgress>(`/dubbing/${id}/status`);
  return data;
}

/**
 * 영상 업로드 → Presigned URL 요청 후 업로드.
 * 반환값은 업로드된 파일의 storage path.
 */
export async function uploadVideo(
  fileUri: string,
  fileName: string,
): Promise<{ video_uri: string }> {
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    name: fileName,
    type: 'video/mp4',
  } as unknown as Blob);

  const { data } = await api.post<{ video_uri: string }>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120_000, // 대용량 파일 업로드를 위해 타임아웃 확장
  });
  return data;
}

/** 더빙 작업 생성 */
export async function createDubbing(
  req: CreateDubbingRequest,
): Promise<CreateDubbingResponse> {
  const { data } = await api.post<CreateDubbingResponse>('/dubbing', req);
  return data;
}

/** 더빙 결과 영상 다운로드 URL 조회 */
export async function fetchDownloadUrl(id: string): Promise<{ url: string }> {
  const { data } = await api.get<{ url: string }>(`/dubbing/${id}/download`);
  return data;
}

export default api;

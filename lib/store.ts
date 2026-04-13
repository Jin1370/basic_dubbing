// ============================================================
// Zustand 스토어 — 인증 상태, 더빙 목록
// ============================================================

import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from './auth';
import { fetchDubbingList, fetchProfile } from './api';
import type { DubbingItem, LanguageCode, UserProfile } from './types';

// --------------- Auth Store ---------------

interface AuthState {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  loadProfile: () => Promise<void>;
  initialize: () => () => void; // 반환: unsubscribe
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  loading: true,

  setSession: (session) => set({ session, loading: false }),

  loadProfile: async () => {
    try {
      const profile = await fetchProfile();
      set({ profile });
    } catch {
      set({ profile: null });
    }
  },

  initialize: () => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session, loading: false });
      if (data.session) {
        get().loadProfile();
      }
    });

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, loading: false });
      if (session) {
        get().loadProfile();
      } else {
        set({ profile: null });
      }
    });

    return () => subscription.unsubscribe();
  },
}));

// --------------- Dubbing Store ---------------

interface DubbingState {
  items: DubbingItem[];
  loading: boolean;
  error: string | null;
  loadItems: () => Promise<void>;

  // 업로드 → 설정 흐름에서 사용하는 임시 상태
  selectedVideoUri: string | null;
  selectedFileName: string | null;
  selectedFileSize: number | null;
  selectedDuration: number | null;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;

  setSelectedVideo: (params: {
    uri: string;
    fileName: string;
    fileSize: number;
    duration: number;
  }) => void;
  setSourceLanguage: (lang: LanguageCode) => void;
  setTargetLanguage: (lang: LanguageCode) => void;
  swapLanguages: () => void;
  resetDubbingFlow: () => void;
}

export const useDubbingStore = create<DubbingState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  loadItems: async () => {
    set({ loading: true, error: null });
    try {
      const items = await fetchDubbingList();
      set({ items, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : '더빙 목록을 불러올 수 없습니다.';
      set({ error: message, loading: false });
    }
  },

  selectedVideoUri: null,
  selectedFileName: null,
  selectedFileSize: null,
  selectedDuration: null,
  sourceLanguage: 'ko',
  targetLanguage: 'en',

  setSelectedVideo: ({ uri, fileName, fileSize, duration }) =>
    set({
      selectedVideoUri: uri,
      selectedFileName: fileName,
      selectedFileSize: fileSize,
      selectedDuration: duration,
    }),

  setSourceLanguage: (lang) => set({ sourceLanguage: lang }),
  setTargetLanguage: (lang) => set({ targetLanguage: lang }),

  swapLanguages: () => {
    const { sourceLanguage, targetLanguage } = get();
    set({ sourceLanguage: targetLanguage, targetLanguage: sourceLanguage });
  },

  resetDubbingFlow: () =>
    set({
      selectedVideoUri: null,
      selectedFileName: null,
      selectedFileSize: null,
      selectedDuration: null,
      sourceLanguage: 'ko',
      targetLanguage: 'en',
    }),
}));

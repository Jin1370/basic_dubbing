// ============================================================
// Supabase Auth 헬퍼 — Google 로그인, 세션 관리
// ============================================================

import { createClient, Session } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl ?? '';
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey ?? '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    detectSessionInUrl: true,
    persistSession: true,
  },
});

/**
 * Google OAuth 로그인을 시작한다.
 * 웹에서는 현재 URL로 리다이렉트, 모바일에서는 Expo 딥링크로 리다이렉트한다.
 */
export async function signInWithGoogle(): Promise<void> {
  const redirectTo =
    Platform.OS === 'web'
      ? window.location.origin
      : Linking.createURL('/');

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * 로그아웃한다.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * 현재 세션을 반환한다.
 */
export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }
  return data.session;
}

/**
 * 현재 유효한 JWT access token을 반환한다.
 * Axios 인터셉터에서 사용한다.
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  return session?.access_token ?? null;
}

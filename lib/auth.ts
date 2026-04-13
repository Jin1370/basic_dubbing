// ============================================================
// Supabase Auth 헬퍼 — Google 로그인, 세션 관리
// ============================================================

import { createClient, Session } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';

const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl ?? '';
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey ?? '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Google OAuth 로그인을 시작한다.
 * Supabase Auth의 signInWithOAuth를 사용하며,
 * 모바일 환경에서는 redirectTo를 Expo AuthSession redirect URI로 설정한다.
 */
export async function signInWithGoogle(): Promise<void> {
  const redirectTo = AuthSession.makeRedirectUri({ useProxy: true });

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

// ============================================================
// 루트 레이아웃 — 인증 상태에 따라 auth / main 분기
// ============================================================

import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../lib/store';

export default function RootLayout() {
  const { session, loading, initialize } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  // Supabase 인증 리스너 등록
  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, []);

  // 인증 상태에 따라 적절한 그룹으로 리다이렉트
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(main)');
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

// ============================================================
// 메인 그룹 레이아웃 (인증된 사용자)
// ============================================================

import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../lib/store';
import { colors } from '../../constants/theme';

export default function MainLayout() {
  const session = useAuthStore((s) => s.session);

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="upload" />
      <Stack.Screen name="dubbing-settings" />
      <Stack.Screen
        name="progress/[id]"
        options={{ gestureEnabled: false }} // 진행 중 스와이프 뒤로가기 방지
      />
      <Stack.Screen name="result/[id]" />
    </Stack>
  );
}

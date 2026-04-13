// ============================================================
// 메인 그룹 레이아웃 (인증된 사용자)
// ============================================================

import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFFFF' },
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

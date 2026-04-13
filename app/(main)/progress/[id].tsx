// ============================================================
// 더빙 진행 상태 화면 — 폴링으로 상태 업데이트
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  AppState,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchDubbingProgress } from '../../../lib/api';
import { DUBBING_STEP_LABELS, DUBBING_STEPS_ORDER } from '../../../lib/types';
import type { DubbingProgress } from '../../../lib/types';
import ProgressBar from '../../../components/ProgressBar';
import { colors } from '../../../constants/theme';

const POLL_INTERVAL_MS = 3000;

export default function ProgressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [progress, setProgress] = useState<DubbingProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;

    const poll = async () => {
      try {
        const data = await fetchDubbingProgress(id);
        setProgress(data);
        setError(null);

        if (data.status === 'completed') {
          stopPolling();
          router.replace(`/(main)/result/${id}`);
        } else if (data.status === 'failed') {
          stopPolling();
          Alert.alert('더빙 실패', '더빙 처리 중 오류가 발생했습니다.', [
            { text: '홈으로', onPress: () => router.replace('/(main)') },
          ]);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '상태를 확인할 수 없습니다.';
        setError(message);
      }
    };

    poll(); // 즉시 한 번 호출
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
  }, [id, router]);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startPolling();

    // 앱이 백그라운드에서 돌아왔을 때 폴링 재개
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        startPolling();
      } else {
        stopPolling();
      }
    });

    return () => {
      stopPolling();
      subscription.remove();
    };
  }, [id, startPolling]);

  const handleGoHome = () => {
    stopPolling();
    router.replace('/(main)');
  };

  const formatRemaining = (seconds: number | null): string => {
    if (seconds == null) return '';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `약 ${m}분 ${s}초`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>더빙 중...</Text>
      </View>

      <View style={styles.content}>
        {/* 애니메이션 아이콘 (Lottie 대체: 스피너) */}
        <View style={styles.animationContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>

        <Text style={styles.statusText}>AI가 더빙을 생성 중입니다</Text>

        {progress && (
          <>
            {/* 현재 단계 */}
            <Text style={styles.stepTitle}>
              현재 단계: {DUBBING_STEP_LABELS[progress.current_step]} (
              {DUBBING_STEPS_ORDER.indexOf(progress.current_step) + 1}/
              {DUBBING_STEPS_ORDER.length})
            </Text>

            {/* 프로그레스 바 */}
            <View style={styles.progressBarContainer}>
              <ProgressBar percent={progress.progress_percent} />
              <Text style={styles.percentText}>{progress.progress_percent}%</Text>
            </View>

            {/* 단계 상세 목록 */}
            <View style={styles.stepsContainer}>
              <Text style={styles.stepsLabel}>단계 상세:</Text>
              {progress.steps.map((s) => {
                const icon =
                  s.status === 'done' ? '✓' : s.status === 'in_progress' ? '▶' : '○';
                const textStyle =
                  s.status === 'done'
                    ? styles.stepDone
                    : s.status === 'in_progress'
                      ? styles.stepActive
                      : styles.stepPending;

                return (
                  <View key={s.step} style={styles.stepRow}>
                    <Text style={[styles.stepIcon, textStyle]}>{icon}</Text>
                    <Text style={[styles.stepText, textStyle]}>
                      {DUBBING_STEPS_ORDER.indexOf(s.step) + 1}.{' '}
                      {DUBBING_STEP_LABELS[s.step]}
                      {s.status === 'done'
                        ? ' 완료'
                        : s.status === 'in_progress'
                          ? ' 중...'
                          : ''}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* 예상 남은 시간 */}
            {progress.estimated_remaining_seconds != null && (
              <Text style={styles.remainingText}>
                예상 남은 시간: {formatRemaining(progress.estimated_remaining_seconds)}
              </Text>
            )}
          </>
        )}

        {/* 에러 */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      {/* 하단 버튼 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.backgroundButton}
          onPress={handleGoHome}
          activeOpacity={0.8}
          accessibilityLabel="백그라운드로 이동하고 홈으로 돌아가기"
        >
          <Text style={styles.backgroundButtonText}>백그라운드로 이동</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
    color: colors.slate900,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  animationContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    color: colors.slate900,
    textAlign: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: colors.slate900,
    textAlign: 'center',
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 8,
  },
  percentText: {
    fontSize: 16,
    color: colors.slate900,
    textAlign: 'center',
    marginTop: 8,
  },
  stepsContainer: {
    width: '100%',
    marginTop: 24,
  },
  stepsLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.slate600,
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepIcon: {
    fontSize: 14,
    width: 20,
  },
  stepText: {
    fontSize: 13,
    lineHeight: 18,
  },
  stepDone: {
    color: colors.success,
  },
  stepActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  stepPending: {
    color: colors.slate400,
  },
  remainingText: {
    fontSize: 13,
    color: colors.slate500,
    textAlign: 'center',
    marginTop: 16,
  },
  errorContainer: {
    marginTop: 16,
    backgroundColor: colors.errorBg,
    padding: 12,
    borderRadius: 10,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  backgroundButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});

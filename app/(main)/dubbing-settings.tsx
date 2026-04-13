// ============================================================
// 더빙 설정 화면 — 언어 선택
// ============================================================

import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDubbingStore } from '../../lib/store';
import { uploadVideo, createDubbing } from '../../lib/api';
import { LANGUAGE_LABELS } from '../../lib/types';
import LanguageSelector from '../../components/LanguageSelector';
import { colors } from '../../constants/theme';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function DubbingSettingsScreen() {
  const router = useRouter();
  const {
    selectedVideoUri,
    selectedFileName,
    selectedDuration,
    sourceLanguage,
    targetLanguage,
    setSourceLanguage,
    setTargetLanguage,
    swapLanguages,
  } = useDubbingStore();

  const [submitting, setSubmitting] = useState(false);

  const handleStart = async () => {
    if (!selectedVideoUri || !selectedFileName) {
      Alert.alert('오류', '선택된 영상이 없습니다.');
      return;
    }

    if (sourceLanguage === targetLanguage) {
      Alert.alert('알림', '원본 언어와 타겟 언어를 다르게 선택해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. 영상 업로드
      const { video_uri } = await uploadVideo(selectedVideoUri, selectedFileName);

      // 2. 더빙 작업 생성
      const result = await createDubbing({
        video_uri,
        file_name: selectedFileName,
        source_language: sourceLanguage,
        target_language: targetLanguage,
      });

      // 3. 진행 화면으로 이동
      router.replace(`/(main)/progress/${result.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : '더빙을 시작할 수 없습니다.';
      Alert.alert('오류', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="뒤로 가기"
        >
          <Text style={styles.backIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>더빙 설정</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        {/* 선택된 영상 요약 */}
        <View style={styles.videoSummary}>
          {selectedVideoUri && (
            <Image
              source={{ uri: selectedVideoUri }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          )}
          <View style={styles.videoInfo}>
            <Text style={styles.videoName} numberOfLines={1}>
              {selectedFileName ?? '영상'}
            </Text>
            <Text style={styles.videoDuration}>
              {selectedDuration ? formatDuration(selectedDuration) : '--:--'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* 원본 언어 */}
        <Text style={styles.label}>원본 언어</Text>
        <LanguageSelector
          value={sourceLanguage}
          onChange={setSourceLanguage}
          accessibilityLabel="원본 언어 선택"
        />

        {/* 언어 교환 버튼 */}
        <TouchableOpacity
          style={styles.swapButton}
          onPress={swapLanguages}
          accessibilityLabel="언어 교환"
        >
          <Text style={styles.swapIcon}>⇅</Text>
        </TouchableOpacity>

        {/* 타겟 언어 */}
        <Text style={styles.label}>타겟 언어</Text>
        <LanguageSelector
          value={targetLanguage}
          onChange={setTargetLanguage}
          accessibilityLabel="타겟 언어 선택"
        />

        <Text style={styles.supportedHint}>
          지원 언어: {Object.values(LANGUAGE_LABELS).join(', ')}
        </Text>
      </View>

      {/* 하단 "더빙 시작" 버튼 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.startButton, submitting && styles.startButtonDisabled]}
          onPress={handleStart}
          disabled={submitting}
          activeOpacity={0.8}
          accessibilityLabel="더빙 시작"
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.startButtonText}>더빙 시작</Text>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: colors.slate900,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
    color: colors.slate900,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  videoSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.slate50,
  },
  videoInfo: {
    marginLeft: 12,
    flex: 1,
  },
  videoName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slate900,
  },
  videoDuration: {
    fontSize: 13,
    color: colors.slate500,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.slate200,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: colors.slate900,
    marginBottom: 8,
  },
  swapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate200,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 8,
  },
  swapIcon: {
    fontSize: 20,
    color: colors.slate600,
  },
  supportedHint: {
    fontSize: 13,
    color: colors.slate500,
    marginTop: 16,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  startButton: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: colors.slate400,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

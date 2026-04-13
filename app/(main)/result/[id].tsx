// ============================================================
// 결과 확인 / 다운로드 화면
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchDubbingDetail, fetchDownloadUrl } from '../../../lib/api';
import { LANGUAGE_LABELS } from '../../../lib/types';
import type { DubbingDetail } from '../../../lib/types';
import VideoPlayer from '../../../components/VideoPlayer';
import { colors } from '../../../constants/theme';

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

type TabType = 'original' | 'dubbed';

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [detail, setDetail] = useState<DubbingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dubbed');
  const [downloading, setDownloading] = useState(false);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDubbingDetail(id);
      setDetail(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : '결과를 불러올 수 없습니다.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { url } = await fetchDownloadUrl(id);
      await Linking.openURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : '다운로드에 실패했습니다.';
      Alert.alert('다운로드 오류', message);
    } finally {
      setDownloading(false);
    }
  };

  const handleNewDubbing = () => {
    router.push('/(main)/upload');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !detail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>더빙 결과</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error ?? '결과를 불러올 수 없습니다.'}</Text>
          <TouchableOpacity onPress={loadDetail}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const videoUrl =
    activeTab === 'dubbed' && detail.dubbed_video_url
      ? detail.dubbed_video_url
      : detail.original_video_url;

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
        <Text style={styles.headerTitle}>더빙 결과</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 영상 플레이어 */}
        <VideoPlayer uri={videoUrl} />

        {/* 원본 / 더빙 탭 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'original' && styles.tabActive]}
            onPress={() => setActiveTab('original')}
            accessibilityLabel="원본 영상 보기"
          >
            <Text
              style={[styles.tabText, activeTab === 'original' && styles.tabTextActive]}
            >
              원본
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'dubbed' && styles.tabActive]}
            onPress={() => setActiveTab('dubbed')}
            accessibilityLabel="더빙 영상 보기"
          >
            <Text
              style={[styles.tabText, activeTab === 'dubbed' && styles.tabTextActive]}
            >
              더빙
            </Text>
          </TouchableOpacity>
        </View>

        {/* 더빙 정보 */}
        <View style={styles.infoSection}>
          <InfoRow label="원본 언어" value={LANGUAGE_LABELS[detail.source_language]} />
          <InfoRow label="타겟 언어" value={LANGUAGE_LABELS[detail.target_language]} />
          <InfoRow label="파일 크기" value={formatFileSize(detail.file_size_bytes)} />
          {detail.completed_at && (
            <InfoRow label="더빙 완료" value={formatDate(detail.completed_at)} />
          )}
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.downloadButton, downloading && styles.downloadButtonDisabled]}
          onPress={handleDownload}
          disabled={downloading}
          activeOpacity={0.8}
          accessibilityLabel="더빙 영상 다운로드"
        >
          {downloading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.downloadButtonText}>다운로드</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.newDubbingButton}
          onPress={handleNewDubbing}
          activeOpacity={0.8}
          accessibilityLabel="새 더빙 시작"
        >
          <Text style={styles.newDubbingButtonText}>새 더빙 시작</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.slate100,
    borderRadius: 10,
    padding: 4,
    marginTop: 16,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.white,
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slate500,
  },
  tabTextActive: {
    color: colors.slate900,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.slate500,
  },
  infoValue: {
    fontSize: 13,
    color: colors.slate900,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  downloadButton: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButtonDisabled: {
    backgroundColor: colors.slate400,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  newDubbingButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newDubbingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});

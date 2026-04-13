// ============================================================
// 영상 업로드 화면
// ============================================================

import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useDubbingStore } from '../../lib/store';

/** 바이트를 읽기 좋은 형식으로 변환 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/** 초를 mm:ss 형식으로 변환 */
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function UploadScreen() {
  const router = useRouter();
  const { selectedVideoUri, selectedFileName, selectedFileSize, selectedDuration, setSelectedVideo } =
    useDubbingStore();

  const [picking, setPicking] = useState(false);

  const handlePickVideo = async () => {
    setPicking(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedVideo({
          uri: asset.uri,
          fileName: asset.fileName ?? 'video.mp4',
          fileSize: asset.fileSize ?? 0,
          duration: (asset.duration ?? 0) / 1000, // ms -> sec
        });
      }
    } catch {
      Alert.alert('오류', '영상을 불러오는 데 실패했습니다.');
    } finally {
      setPicking(false);
    }
  };

  const handleNext = () => {
    if (!selectedVideoUri) {
      Alert.alert('알림', '먼저 영상을 선택해 주세요.');
      return;
    }
    router.push('/(main)/dubbing-settings');
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
        <Text style={styles.headerTitle}>영상 선택</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        {!selectedVideoUri ? (
          /* 영상 미선택 상태 */
          <View style={styles.uploadArea}>
            <Text style={styles.uploadIcon}>🎥</Text>
            <Text style={styles.uploadText}>갤러리에서 영상을 선택하세요</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={handlePickVideo}
              disabled={picking}
              activeOpacity={0.8}
              accessibilityLabel="갤러리에서 영상 선택"
            >
              <Text style={styles.selectButtonText}>
                {picking ? '불러오는 중...' : '갤러리에서 선택하기'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* 영상 선택됨 */
          <View>
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: selectedVideoUri }}
                style={styles.preview}
                resizeMode="cover"
              />
              <View style={styles.playOverlay}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
            </View>

            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{selectedFileName}</Text>
              <Text style={styles.fileMeta}>
                {selectedFileSize ? formatFileSize(selectedFileSize) : ''}
                {'  '}
                {selectedDuration ? formatDuration(selectedDuration) : ''}
              </Text>
            </View>

            {/* 다시 선택 */}
            <TouchableOpacity
              style={styles.reselectButton}
              onPress={handlePickVideo}
              accessibilityLabel="다른 영상 선택"
            >
              <Text style={styles.reselectText}>다른 영상 선택</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.formatHint}>지원 형식: MP4, MOV (최대 500MB)</Text>
      </View>

      {/* 하단 "다음 단계" 버튼 */}
      {selectedVideoUri && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
            accessibilityLabel="다음 단계로 이동"
          >
            <Text style={styles.nextButtonText}>다음 단계</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#0F172A',
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
    color: '#0F172A',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  uploadArea: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 24,
  },
  selectButton: {
    height: 48,
    paddingHorizontal: 24,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  previewContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  fileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  fileMeta: {
    fontSize: 13,
    color: '#64748B',
  },
  reselectButton: {
    marginTop: 12,
    alignSelf: 'center',
  },
  reselectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  formatHint: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 24,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  nextButton: {
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

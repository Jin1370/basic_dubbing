// ============================================================
// VideoPlayer — 영상 재생 컴포넌트 (expo-av 기반)
// ============================================================

import { useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

interface VideoPlayerProps {
  uri: string;
}

export default function VideoPlayer({ uri }: VideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setIsPlaying(status.isPlaying);
    setPositionMs(status.positionMillis ?? 0);
    setDurationMs(status.durationMillis ?? 0);
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.videoWrapper}>
        <Video
          ref={videoRef}
          source={{ uri }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          useNativeControls={false}
        />

        {/* 재생/일시정지 오버레이 */}
        <TouchableOpacity
          style={styles.overlay}
          onPress={togglePlayPause}
          activeOpacity={0.8}
          accessibilityLabel={isPlaying ? '일시정지' : '재생'}
          accessibilityRole="button"
        >
          {!isPlaying && (
            <View style={styles.playButton}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* 시크바 + 시간 */}
      <View style={styles.seekBarContainer}>
        <View style={styles.seekTrack}>
          <View style={[styles.seekFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.timeText}>
          {formatTime(positionMs)} / {formatTime(durationMs)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  videoWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
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
  seekBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  seekTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  seekFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 2,
  },
  timeText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 8,
    minWidth: 80,
    textAlign: 'right',
  },
});

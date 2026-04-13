// ============================================================
// VideoCard — 더빙 이력 카드 컴포넌트
// ============================================================

import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import type { DubbingItem, DubbingStatus } from '../lib/types';
import { LANGUAGE_LABELS } from '../lib/types';

interface VideoCardProps {
  item: DubbingItem;
  onPress: () => void;
}

const STATUS_CONFIG: Record<DubbingStatus, { label: string; bg: string; text: string }> = {
  completed: { label: '완료', bg: '#F0FDF4', text: '#22C55E' },
  processing: { label: '처리중', bg: '#FFF7ED', text: '#F59E0B' },
  uploading: { label: '업로드중', bg: '#FFF7ED', text: '#F59E0B' },
  failed: { label: '실패', bg: '#FEF2F2', text: '#EF4444' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function VideoCard({ item, onPress }: VideoCardProps) {
  const status = STATUS_CONFIG[item.status];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={`${item.title}, ${LANGUAGE_LABELS[item.source_language]}에서 ${LANGUAGE_LABELS[item.target_language]}로, ${status.label}`}
      accessibilityRole="button"
    >
      {/* 썸네일 */}
      {item.thumbnail_url ? (
        <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
          <Text style={styles.thumbnailIcon}>🎬</Text>
        </View>
      )}

      {/* 정보 */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.languages}>
          {LANGUAGE_LABELS[item.source_language]} → {LANGUAGE_LABELS[item.target_language]}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.date}>{formatDate(item.created_at)}</Text>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  thumbnailPlaceholder: {
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailIcon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: '#0F172A',
  },
  languages: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  date: {
    fontSize: 13,
    color: '#64748B',
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});

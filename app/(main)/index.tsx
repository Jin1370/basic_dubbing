// ============================================================
// 홈 화면 — 더빙 이력 목록 + 새 더빙 FAB
// ============================================================

import { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore, useDubbingStore } from '../../lib/store';
import VideoCard from '../../components/VideoCard';
import { colors } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { items, loading, error, loadItems } = useDubbingStore();

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleNewDubbing = useCallback(() => {
    useDubbingStore.getState().resetDubbingFlow();
    router.push('/(main)/upload');
  }, [router]);

  const handleItemPress = useCallback(
    (id: string) => {
      router.push(`/(main)/result/${id}`);
    },
    [router],
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎬</Text>
      <Text style={styles.emptyTitle}>아직 더빙 이력이 없어요</Text>
      <Text style={styles.emptySubtitle}>아래 버튼으로 시작해보세요</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>하네스 더빙</Text>
        {profile?.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {profile?.display_name?.charAt(0) ?? 'U'}
            </Text>
          </View>
        )}
      </View>

      {/* 섹션 제목 */}
      <Text style={styles.sectionTitle}>내 더빙 목록</Text>

      {/* 에러 메시지 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadItems} accessibilityLabel="다시 시도">
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 로딩 */}
      {loading && items.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VideoCard item={item} onPress={() => handleItemPress(item.id)} />
          )}
          contentContainerStyle={items.length === 0 ? styles.emptyList : styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadItems} tintColor={colors.primary} />
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleNewDubbing}
        activeOpacity={0.8}
        accessibilityLabel="새 더빙 시작"
        accessibilityRole="button"
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
    color: colors.slate900,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    color: colors.slate900,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyContainer: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slate900,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.slate500,
  },
  errorContainer: {
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: colors.errorBg,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    flex: 1,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 12,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 40,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(37, 99, 235, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 28,
    color: colors.white,
    fontWeight: '400',
    lineHeight: 28,
  },
});

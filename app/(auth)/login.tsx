// ============================================================
// Google 로그인 화면
// ============================================================

import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import { signInWithGoogle } from '../../lib/auth';
import { colors } from '../../constants/theme';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const message = err instanceof Error ? err.message : '로그인에 실패했습니다.';
      Alert.alert('로그인 오류', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 앱 로고 영역 */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>H</Text>
          </View>
        </View>

        {/* 앱 이름 */}
        <Text style={styles.title}>하네스 더빙 스튜디오</Text>

        {/* 서브텍스트 */}
        <Text style={styles.subtitle}>AI로 영상을 다른 언어로 더빙</Text>

        {/* Google 로그인 버튼 */}
        <TouchableOpacity
          style={[styles.googleButton, loading && styles.googleButtonDisabled]}
          onPress={handleGoogleLogin}
          disabled={loading}
          activeOpacity={0.8}
          accessibilityLabel="Google로 로그인하기"
          accessibilityRole="button"
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleButtonText}>
            {loading ? '로그인 중...' : 'Google로 계속하기'}
          </Text>
        </TouchableOpacity>

        {/* 이용약관 */}
        <Text style={styles.terms}>
          계속하면 이용약관에 동의합니다
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    color: colors.slate900,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: colors.slate500,
    textAlign: 'center',
    marginBottom: 40,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
  },
  googleButtonDisabled: {
    backgroundColor: colors.slate400,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 28,
    height: 28,
    lineHeight: 28,
    textAlign: 'center',
    borderRadius: 6,
    overflow: 'hidden',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    color: colors.white,
  },
  terms: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    color: colors.slate500,
    textAlign: 'center',
    marginTop: 16,
  },
});

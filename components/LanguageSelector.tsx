// ============================================================
// LanguageSelector — 언어 선택 바텀시트 드롭다운
// ============================================================

import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native';
import type { LanguageCode } from '../lib/types';
import { LANGUAGE_LABELS } from '../lib/types';
import { colors } from '../constants/theme';

interface LanguageSelectorProps {
  value: LanguageCode;
  onChange: (code: LanguageCode) => void;
  accessibilityLabel?: string;
}

const LANGUAGES = Object.entries(LANGUAGE_LABELS) as [LanguageCode, string][];

export default function LanguageSelector({
  value,
  onChange,
  accessibilityLabel,
}: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (code: LanguageCode) => {
    onChange(code);
    setOpen(false);
  };

  return (
    <>
      {/* 트리거 */}
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
      >
        <Text style={styles.triggerText}>{LANGUAGE_LABELS[value]}</Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      {/* 바텀시트 모달 */}
      <Modal visible={open} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            {/* 핸들바 */}
            <View style={styles.handleBar} />

            <Text style={styles.sheetTitle}>언어 선택</Text>

            <FlatList
              data={LANGUAGES}
              keyExtractor={([code]) => code}
              renderItem={({ item: [code, label] }) => {
                const isSelected = code === value;
                return (
                  <TouchableOpacity
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => handleSelect(code)}
                    accessibilityLabel={`${label} 선택`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                    {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    height: 48,
    backgroundColor: colors.slate50,
    borderWidth: 1.5,
    borderColor: colors.slate200,
    borderRadius: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerText: {
    fontSize: 16,
    color: colors.slate900,
  },
  arrow: {
    fontSize: 12,
    color: colors.slate500,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '50%',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.slate300,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.slate900,
    marginBottom: 16,
  },
  option: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  optionSelected: {
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    fontSize: 16,
    color: colors.slate900,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  checkIcon: {
    fontSize: 18,
    color: colors.primary,
  },
});

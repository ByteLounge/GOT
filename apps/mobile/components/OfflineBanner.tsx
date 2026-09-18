import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../stores/themeStore';

interface Props {
  visible: boolean;
}

export const OfflineBanner: React.FC<Props> = ({ visible }) => {
  const { colors } = useThemeStore();
  if (!visible) return null;

  return (
    <View style={[styles.banner, { backgroundColor: colors.isDark ? '#78350F' : '#FEF3C7' }]}>
      <Ionicons name="cloud-offline-outline" size={16} color={colors.isDark ? '#FDE68A' : '#92400E'} />
      <Text style={[styles.text, { color: colors.isDark ? '#FDE68A' : '#92400E' }]}>
        Offline — showing cached data. Reconnect for latest updates.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

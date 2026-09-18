import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { OpportunityCard } from '../../components/OpportunityCard';
import { useThemeStore } from '../../stores/themeStore';
import { useSavedStore } from '../../stores/savedStore';

export default function SavedScreen() {
  const router = useRouter();
  const { colors } = useThemeStore();
  const { savedList } = useSavedStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(savedList.map(o => o.category)))];

  const filtered = selectedCategory === 'All'
    ? savedList
    : savedList.filter(o => o.category === selectedCategory);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Saved" subtitle="Bookmarked opportunities & upcoming deadlines" />

      {/* Category selector if items exist */}
      {savedList.length > 0 && categories.length > 2 && (
        <View style={[styles.categoryBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item}
            contentContainerStyle={styles.categoryScroll}
            renderItem={({ item }) => {
              const isSelected = selectedCategory === item;
              return (
                <TouchableOpacity
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(item)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? '#FFFFFF' : colors.textPrimary, fontWeight: isSelected ? '700' : '500' },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {savedList.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surfaceVariant }]}>
            <Ionicons name="bookmark-outline" size={40} color={colors.textMuted} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Saved Opportunities</Text>
          <Text style={[styles.subText, { color: colors.textSecondary }]}>
            Bookmark opportunities while browsing to track upcoming deadlines and receive priority alerts.
          </Text>
          <TouchableOpacity
            style={[styles.exploreBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/discover')}
          >
            <Text style={styles.exploreBtnText}>Discover Openings</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <OpportunityCard
              opportunity={item}
              onPress={() => router.push(`/opportunity/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    gap: 12,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  subText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  exploreBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

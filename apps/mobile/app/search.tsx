import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../stores/themeStore';
import { OpportunityCard } from '../components/OpportunityCard';
import { MobileApiService } from '../services/api';
import { Opportunity } from '@govalert/types';

const TRENDING_SEARCHES = [
  'ISRO',
  'DRDO',
  'UPSC',
  'SSC JE',
  'Software Engineer',
  'Pragati Scholarship',
  'AI Internship',
  'Central Sector Scheme',
  'Maharashtra',
  'GATE 2027',
];

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useThemeStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced live search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await MobileApiService.search(query.trim());
        setResults(res.data.results);
        setHasSearched(true);
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Header Bar */}
      <View style={[styles.searchBarContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceVariant }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            placeholder="Search UPSC, ISRO, scholarship, CS..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content Area */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Searching verified opportunities...</Text>
        </View>
      ) : hasSearched && results.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Results for "{query}"</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Check your spelling or try broader keywords like "Engineering", "Scholarship", or "UPSC".
          </Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <OpportunityCard
              opportunity={item}
              onPress={() => router.push(`/opportunity/${item.id}`)}
            />
          )}
        />
      ) : (
        <View style={styles.trendingContainer}>
          <Text style={[styles.trendingTitle, { color: colors.textPrimary }]}>Trending Searches</Text>
          <View style={styles.trendingGrid}>
            {TRENDING_SEARCHES.map(item => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.trendingChip,
                  { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
                ]}
                onPress={() => setQuery(item)}
              >
                <Ionicons name="trending-up-outline" size={14} color={colors.primary} />
                <Text style={[styles.trendingText, { color: colors.textPrimary }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  trendingContainer: {
    padding: 20,
  },
  trendingTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 14,
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  trendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  trendingText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

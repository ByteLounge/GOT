import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { OpportunityCard } from '../../components/OpportunityCard';
import { FilterModal, FilterState } from '../../components/FilterModal';
import { useThemeStore } from '../../stores/themeStore';
import { MobileApiService } from '../../services/api';
import { Opportunity } from '@govalert/types';
import { OPPORTUNITY_CATEGORIES } from '@govalert/shared';

export default function DiscoverScreen() {
  const router = useRouter();
  const { colors } = useThemeStore();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filters, setFilters] = useState<FilterState>({
    category: 'All',
    education: 'All',
    location: 'All India',
    status: '',
    organization: '',
    sort: 'deadline_asc',
  });

  const loadOpportunities = async (activeFilters: FilterState) => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        limit: 50,
        sort: activeFilters.sort,
      };
      if (activeFilters.category !== 'All') params.category = activeFilters.category;
      if (activeFilters.education !== 'All') params.education = activeFilters.education;
      if (activeFilters.location !== 'All India') params.location = activeFilters.location;
      if (activeFilters.status) params.status = activeFilters.status;
      if (activeFilters.organization) params.organization = activeFilters.organization;

      const res = await MobileApiService.getOpportunities(params);
      setOpportunities(res.data.data);
    } catch (err) {
      console.warn('Discover load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities(filters);
  }, [filters]);

  const handleCategoryChipPress = (cat: string) => {
    setSelectedCategory(cat);
    const updated = { ...filters, category: cat };
    setFilters(updated);
  };

  const activeFilterCount = [
    filters.education !== 'All' ? 1 : 0,
    filters.location !== 'All India' ? 1 : 0,
    filters.status ? 1 : 0,
    filters.organization ? 1 : 0,
    filters.sort !== 'deadline_asc' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Discover" subtitle="Browse by category and requirements" />

      {/* Top filter toolbar */}
      <View style={[styles.toolbar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {['All', ...OPPORTUNITY_CATEGORIES].map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleCategoryChipPress(cat)}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={18} color={colors.textPrimary} />
          {activeFilterCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.subText, { color: colors.textMuted }]}>Filtering opportunities...</Text>
        </View>
      ) : opportunities.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No opportunities found</Text>
          <Text style={[styles.subText, { color: colors.textSecondary }]}>
            Try clearing filters or searching with different criteria.
          </Text>
          <TouchableOpacity
            style={[styles.resetBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              const reset: FilterState = {
                category: 'All',
                education: 'All',
                location: 'All India',
                status: '',
                organization: '',
                sort: 'deadline_asc',
              };
              setSelectedCategory('All');
              setFilters(reset);
            }}
          >
            <Text style={styles.resetBtnText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={opportunities}
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

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        filters={filters}
        onApply={applied => {
          setSelectedCategory(applied.category);
          setFilters(applied);
        }}
        onClose={() => setFilterModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  categoryScroll: {
    paddingRight: 10,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
  },
  filterBtn: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 6,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  subText: {
    fontSize: 13,
    textAlign: 'center',
  },
  resetBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

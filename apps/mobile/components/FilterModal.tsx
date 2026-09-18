import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../stores/themeStore';
import { OPPORTUNITY_CATEGORIES, EDUCATION_LEVELS, INDIAN_STATES } from '@govalert/shared';

export interface FilterState {
  category: string;
  education: string;
  location: string;
  status: string;
  organization: string;
  sort: 'deadline_asc' | 'newest' | 'vacancies_desc';
}

interface Props {
  visible: boolean;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'CLOSING_SOON', label: 'Closing Soon' },
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'CLOSED', label: 'Closed' },
];

const SORT_OPTIONS = [
  { value: 'deadline_asc', label: 'Soonest Deadline' },
  { value: 'newest', label: 'Recently Added' },
  { value: 'vacancies_desc', label: 'Most Vacancies' },
];

export const FilterModal: React.FC<Props> = ({ visible, filters: initialFilters, onApply, onClose }) => {
  const { colors } = useThemeStore();
  const [filters, setFilters] = useState<FilterState>({ ...initialFilters });

  const resetFilters = () => {
    setFilters({
      category: 'All',
      education: 'All',
      location: 'All India',
      status: '',
      organization: '',
      sort: 'deadline_asc',
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Filter Opportunities</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={resetFilters} style={styles.resetBtn}>
                <Text style={[styles.resetText, { color: colors.primary }]}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Sort */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Sort By</Text>
              <View style={styles.chipGrid}>
                {SORT_OPTIONS.map(s => {
                  const isSelected = filters.sort === s.value;
                  return (
                    <TouchableOpacity
                      key={s.value}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setFilters({ ...filters, sort: s.value as any })}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? '#FFFFFF' : colors.textPrimary, fontWeight: isSelected ? '700' : '500' },
                        ]}
                      >
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Category */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Category</Text>
              <View style={styles.chipGrid}>
                {['All', ...OPPORTUNITY_CATEGORIES].map(cat => {
                  const isSelected = filters.category === cat || (!filters.category && cat === 'All');
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setFilters({ ...filters, category: cat })}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? '#FFFFFF' : colors.textPrimary, fontWeight: isSelected ? '700' : '500' },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Education Level */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Education Level</Text>
              <View style={styles.chipGrid}>
                {['All', ...EDUCATION_LEVELS].map(edu => {
                  const isSelected = filters.education === edu || (!filters.education && edu === 'All');
                  return (
                    <TouchableOpacity
                      key={edu}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setFilters({ ...filters, education: edu })}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? '#FFFFFF' : colors.textPrimary, fontWeight: isSelected ? '700' : '500' },
                        ]}
                      >
                        {edu}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Status */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Deadline Status</Text>
              <View style={styles.chipGrid}>
                {STATUS_OPTIONS.map(st => {
                  const isSelected = filters.status === st.value;
                  return (
                    <TouchableOpacity
                      key={st.value}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setFilters({ ...filters, status: st.value })}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? '#FFFFFF' : colors.textPrimary, fontWeight: isSelected ? '700' : '500' },
                        ]}
                      >
                        {st.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Organization Search */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Organization</Text>
              <View style={[styles.searchBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                <Ionicons name="search" size={16} color={colors.textMuted} />
                <TextInput
                  placeholder="e.g. UPSC, ISRO, SSC, DRDO"
                  placeholderTextColor={colors.textMuted}
                  value={filters.organization}
                  onChangeText={txt => setFilters({ ...filters, organization: txt })}
                  style={[styles.searchInput, { color: colors.textPrimary }]}
                />
                {filters.organization ? (
                  <TouchableOpacity onPress={() => setFilters({ ...filters, organization: '' })}>
                    <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </ScrollView>

          {/* Footer Apply Button */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                onApply(filters);
                onClose();
              }}
            >
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    maxHeight: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  resetBtn: {
    paddingVertical: 4,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  applyBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

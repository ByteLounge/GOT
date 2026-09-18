import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Opportunity } from '@govalert/types';
import { useThemeStore } from '../stores/themeStore';
import { useSavedStore } from '../stores/savedStore';
import { calculateDeadlineInfo, formatDateIndian } from '@govalert/shared';

interface Props {
  opportunity: Opportunity;
  onPress: () => void;
}

export const OpportunityCard: React.FC<Props> = ({ opportunity, onPress }) => {
  const { colors } = useThemeStore();
  const { isSaved, toggleSave } = useSavedStore();

  const saved = isSaved(opportunity.id);
  const deadlineInfo = calculateDeadlineInfo(
    opportunity.applicationDeadline,
    opportunity.applicationStartDate
  );

  const potentialMatch = opportunity.potentialMatch;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Top row: Category tag & Bookmark button */}
      <View style={styles.topRow}>
        <View style={[styles.categoryTag, { backgroundColor: colors.badgeBg }]}>
          <Text style={[styles.categoryText, { color: colors.badgeText }]}>
            {opportunity.category}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => toggleSave(opportunity)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.bookmarkBtn}
        >
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={saved ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Title & Organization */}
      <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
        {opportunity.title}
      </Text>
      <Text style={[styles.org, { color: colors.textSecondary }]} numberOfLines={1}>
        {opportunity.organization}
      </Text>

      {/* Meta tags (Location, Vacancies, Salary/Stipend) */}
      <View style={styles.metaRow}>
        {opportunity.location && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={colors.textMuted} />
            <Text style={[styles.metaText, { color: colors.textMuted }]} numberOfLines={1}>
              {opportunity.location}
            </Text>
          </View>
        )}

        {opportunity.vacancyCount != null && (
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={13} color={colors.textMuted} />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              {opportunity.vacancyCount.toLocaleString('en-IN')} Posts
            </Text>
          </View>
        )}
      </View>

      {/* Potential Match pill */}
      {potentialMatch && (
        <View
          style={[
            styles.matchPill,
            {
              backgroundColor: potentialMatch.isPotentiallyEligible
                ? colors.isDark ? '#064E3B' : '#ECFDF5'
                : colors.isDark ? '#374151' : '#F3F4F6',
            },
          ]}
        >
          <Ionicons
            name={potentialMatch.isPotentiallyEligible ? 'checkmark-circle' : 'information-circle-outline'}
            size={14}
            color={potentialMatch.isPotentiallyEligible ? colors.success : colors.textSecondary}
          />
          <Text
            style={[
              styles.matchText,
              {
                color: potentialMatch.isPotentiallyEligible ? colors.success : colors.textSecondary,
              },
            ]}
          >
            {potentialMatch.isPotentiallyEligible
              ? `Potentially eligible (${potentialMatch.matchScore}%)`
              : 'Check eligibility details'}
          </Text>
        </View>
      )}

      {/* Bottom row: Deadline & Source verification */}
      <View style={[styles.bottomRow, { borderTopColor: colors.cardBorder }]}>
        <View style={styles.deadlineContainer}>
          <Text style={[styles.deadlineLabel, { color: colors.textMuted }]}>
            Deadline: {formatDateIndian(opportunity.applicationDeadline)}
          </Text>
        </View>

        <View style={[styles.deadlineBadge, { backgroundColor: `${deadlineInfo.badgeColor}15` }]}>
          <Text style={[styles.deadlineBadgeText, { color: deadlineInfo.badgeColor }]}>
            {deadlineInfo.label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bookmarkBtn: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 4,
  },
  org: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  matchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  deadlineContainer: {
    flex: 1,
  },
  deadlineLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  deadlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deadlineBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

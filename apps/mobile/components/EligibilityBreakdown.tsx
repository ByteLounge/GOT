import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PotentialMatch } from '@govalert/types';
import { useThemeStore } from '../stores/themeStore';

interface Props {
  match?: PotentialMatch | null;
}

export const EligibilityBreakdown: React.FC<Props> = ({ match }) => {
  const { colors } = useThemeStore();

  if (!match) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceVariant,
          borderColor: match.isPotentiallyEligible ? colors.success : colors.cardBorder,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Ionicons
            name={match.isPotentiallyEligible ? 'shield-checkmark' : 'alert-circle-outline'}
            size={20}
            color={match.isPotentiallyEligible ? colors.success : colors.warning}
          />
          <Text style={[styles.title, { color: colors.textPrimary }]}>Profile Match Analysis</Text>
        </View>

        <View
          style={[
            styles.scoreBadge,
            {
              backgroundColor: match.isPotentiallyEligible
                ? colors.isDark ? '#064E3B' : '#DCFCE7'
                : colors.isDark ? '#78350F' : '#FEF3C7',
            },
          ]}
        >
          <Text
            style={[
              styles.scoreText,
              { color: match.isPotentiallyEligible ? colors.success : colors.warning },
            ]}
          >
            {match.matchScore}% Match
          </Text>
        </View>
      </View>

      <Text style={[styles.statusText, { color: match.isPotentiallyEligible ? colors.success : colors.textSecondary }]}>
        {match.isPotentiallyEligible
          ? 'Potentially eligible based on your profile'
          : 'May not meet all requirements'}
      </Text>

      {/* Matched criteria list */}
      <View style={styles.list}>
        {match.matchedCriteria.map((crit, idx) => (
          <View key={`match-${idx}`} style={styles.criterionRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={[styles.criterionText, { color: colors.textPrimary }]}>{crit}</Text>
          </View>
        ))}

        {/* Unmatched / restrictive criteria */}
        {match.unmatchedCriteria.map((crit, idx) => (
          <View key={`unmatch-${idx}`} style={styles.criterionRow}>
            <Ionicons name="close-circle" size={16} color={colors.danger} />
            <Text style={[styles.criterionText, { color: colors.danger }]}>{crit}</Text>
          </View>
        ))}

        {/* Missing profile fields */}
        {match.missingProfileFields?.map((crit, idx) => (
          <View key={`missing-${idx}`} style={styles.criterionRow}>
            <Ionicons name="help-circle-outline" size={16} color={colors.warning} />
            <Text style={[styles.criterionText, { color: colors.textMuted }]}>
              Profile missing: {crit}
            </Text>
          </View>
        ))}
      </View>

      {/* Official Disclaimer */}
      <View style={[styles.disclaimerBox, { borderTopColor: colors.border }]}>
        <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
        <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>
          Important: This is a preliminary automated estimate. Check the official notification document for final eligibility criteria.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '800',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  list: {
    gap: 8,
    marginBottom: 10,
  },
  criterionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  criterionText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  disclaimerText: {
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
    fontStyle: 'italic',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useThemeStore } from '../../stores/themeStore';
import { useSavedStore } from '../../stores/savedStore';
import { useTrackerStore } from '../../stores/trackerStore';
import { MobileApiService } from '../../services/api';
import { MobileCalendarService } from '../../services/calendar';
import { EligibilityBreakdown } from '../../components/EligibilityBreakdown';
import { ReminderModal } from '../../components/ReminderModal';
import { Opportunity } from '@govalert/types';
import { calculateDeadlineInfo, formatDateIndian, formatSalary } from '@govalert/shared';

export default function OpportunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useThemeStore();
  const { isSaved, toggleSave } = useSavedStore();
  const { track } = useTrackerStore();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadDetail(id);
    }
  }, [id]);

  const loadDetail = async (oppId: string) => {
    setLoading(true);
    try {
      const res = await MobileApiService.getOpportunityById(oppId);
      setOpportunity(res.data.opportunity);
      const vers = await MobileApiService.getOpportunityById(`${oppId}/versions`);
      setVersions((vers.data as any)?.versions || []);
    } catch (err) {
      console.warn('Detail load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUrl = async (url?: string | null, label?: string) => {
    if (!url) {
      Alert.alert('Link Unavailable', `No verified official link is attached to this notification.`);
      return;
    }
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      Linking.openURL(url);
    }
  };

  const handleSyncToCalendar = async () => {
    if (!opportunity || !opportunity.applicationDeadline) {
      Alert.alert('No Deadline Available', 'This opportunity does not have a confirmed deadline to add to calendar.');
      return;
    }

    const res = await MobileCalendarService.addOpportunityEventToCalendar(
      opportunity.title,
      opportunity.organization,
      opportunity.applicationDeadline,
      'Application Deadline',
      opportunity.officialApplicationUrl || opportunity.officialSourceUrl
    );

    if (res.success) {
      Alert.alert('Synced to Calendar', 'The application deadline has been scheduled on your device calendar with 1-day and 1-hour alerts.');
    } else {
      Alert.alert('Calendar Sync', res.error || 'Failed to sync event.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading verified details...</Text>
      </View>
    );
  }

  if (!opportunity) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>Opportunity Not Found</Text>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const saved = isSaved(opportunity.id);
  const deadlineInfo = calculateDeadlineInfo(opportunity.applicationDeadline, opportunity.applicationStartDate);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.badgeBg }]}>
            <Text style={[styles.categoryBadgeText, { color: colors.badgeText }]}>{opportunity.category}</Text>
          </View>

          <View style={[styles.deadlineBadge, { backgroundColor: `${deadlineInfo.badgeColor}15` }]}>
            <Text style={[styles.deadlineBadgeText, { color: deadlineInfo.badgeColor }]}>{deadlineInfo.label}</Text>
          </View>
        </View>

        {/* Title & Organization */}
        <Text style={[styles.title, { color: colors.textPrimary }]}>{opportunity.title}</Text>
        <Text style={[styles.org, { color: colors.primary }]}>{opportunity.organization}</Text>

        {/* Source Authenticity Verified Box */}
        <View style={[styles.verifiedBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
          <Ionicons name="shield-checkmark" size={18} color={colors.success} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.verifiedTitle, { color: colors.textPrimary }]}>
              Official Source Verified: {opportunity.sourceName}
            </Text>
            <Text style={[styles.verifiedSub, { color: colors.textMuted }]}>
              Last checked: {formatDateIndian(opportunity.lastVerifiedAt)} • Direct Government Portal
            </Text>
          </View>
        </View>

        {/* Key Quick Facts Grid */}
        <View style={[styles.factsGrid, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <View style={styles.factItem}>
            <Text style={[styles.factLabel, { color: colors.textMuted }]}>Deadline</Text>
            <Text style={[styles.factValue, { color: colors.textPrimary }]}>
              {formatDateIndian(opportunity.applicationDeadline)}
            </Text>
          </View>

          {opportunity.vacancyCount != null && (
            <View style={styles.factItem}>
              <Text style={[styles.factLabel, { color: colors.textMuted }]}>Vacancies</Text>
              <Text style={[styles.factValue, { color: colors.textPrimary }]}>
                {opportunity.vacancyCount.toLocaleString('en-IN')} Posts
              </Text>
            </View>
          )}

          {(opportunity.salaryMin || opportunity.stipend) && (
            <View style={styles.factItem}>
              <Text style={[styles.factLabel, { color: colors.textMuted }]}>Pay / Stipend</Text>
              <Text style={[styles.factValue, { color: colors.textPrimary }]}>
                {formatSalary(opportunity.salaryMin, opportunity.salaryMax, opportunity.stipend)}
              </Text>
            </View>
          )}

          {opportunity.examDate && (
            <View style={styles.factItem}>
              <Text style={[styles.factLabel, { color: colors.textMuted }]}>Exam Date</Text>
              <Text style={[styles.factValue, { color: colors.textPrimary }]}>
                {formatDateIndian(opportunity.examDate)}
              </Text>
            </View>
          )}

          {opportunity.applicationFee != null && (
            <View style={styles.factItem}>
              <Text style={[styles.factLabel, { color: colors.textMuted }]}>Application Fee</Text>
              <Text style={[styles.factValue, { color: colors.textPrimary }]}>
                {opportunity.applicationFee === 0 ? 'Nil / Free' : `₹${opportunity.applicationFee}`}
              </Text>
            </View>
          )}

          {opportunity.location && (
            <View style={styles.factItem}>
              <Text style={[styles.factLabel, { color: colors.textMuted }]}>Job Location</Text>
              <Text style={[styles.factValue, { color: colors.textPrimary }]}>{opportunity.location}</Text>
            </View>
          )}
        </View>

        {/* Profile Match / Eligibility Engine Breakdown */}
        <EligibilityBreakdown match={opportunity.potentialMatch} />

        {/* Description */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Overview & Scope</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{opportunity.description}</Text>
        </View>

        {/* Detailed Requirements */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Eligibility & Qualifications</Text>

          {opportunity.eligibility ? (
            <Text style={[styles.bodyText, { color: colors.textSecondary, marginBottom: 12 }]}>
              {opportunity.eligibility}
            </Text>
          ) : null}

          {opportunity.educationRequirements.length > 0 && (
            <View style={styles.reqBlock}>
              <Text style={[styles.reqLabel, { color: colors.textMuted }]}>Eligible Degrees</Text>
              <Text style={[styles.reqValue, { color: colors.textPrimary }]}>
                {opportunity.educationRequirements.join(', ')}
              </Text>
            </View>
          )}

          {opportunity.branchRequirements.length > 0 && (
            <View style={styles.reqBlock}>
              <Text style={[styles.reqLabel, { color: colors.textMuted }]}>Discipline / Branch</Text>
              <Text style={[styles.reqValue, { color: colors.textPrimary }]}>
                {opportunity.branchRequirements.join(', ')}
              </Text>
            </View>
          )}

          {opportunity.ageLimit && (
            <View style={styles.reqBlock}>
              <Text style={[styles.reqLabel, { color: colors.textMuted }]}>Age Limit</Text>
              <Text style={[styles.reqValue, { color: colors.textPrimary }]}>
                {opportunity.ageLimit.min ? `${opportunity.ageLimit.min} to ` : 'Up to '}
                {opportunity.ageLimit.max} years (relaxations as per Govt rules)
              </Text>
            </View>
          )}

          {opportunity.experienceRequirements && (
            <View style={styles.reqBlock}>
              <Text style={[styles.reqLabel, { color: colors.textMuted }]}>Experience</Text>
              <Text style={[styles.reqValue, { color: colors.textPrimary }]}>
                {opportunity.experienceRequirements}
              </Text>
            </View>
          )}
        </View>

        {/* Corrigenda / Change History */}
        {versions.length > 0 && (
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Official Updates & Corrigenda</Text>
            {versions.map((ver, i) => (
              <View key={`v-${i}`} style={styles.versionRow}>
                <Ionicons name="git-commit-outline" size={16} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.versionSummary, { color: colors.textPrimary }]}>
                    {ver.changesSummary || 'Details updated'}
                  </Text>
                  <Text style={[styles.versionDate, { color: colors.textMuted }]}>
                    Detected on: {formatDateIndian(ver.createdAt)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Secondary Action Toolbar: Bookmark, Set Reminder, Add to Calendar, Track */}
        <View style={styles.toolRow}>
          <TouchableOpacity
            style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => toggleSave(opportunity)}
          >
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={saved ? colors.primary : colors.textPrimary}
            />
            <Text style={[styles.toolBtnText, { color: saved ? colors.primary : colors.textPrimary }]}>
              {saved ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setReminderModalVisible(true)}
          >
            <Ionicons name="alarm-outline" size={18} color={colors.textPrimary} />
            <Text style={[styles.toolBtnText, { color: colors.textPrimary }]}>Reminder</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleSyncToCalendar}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.textPrimary} />
            <Text style={[styles.toolBtnText, { color: colors.textPrimary }]}>Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => {
              track(opportunity.id, 'Planning to Apply');
              Alert.alert('Added to Tracker', 'Marked as "Planning to Apply" in your application pipeline.');
            }}
          >
            <Ionicons name="briefcase-outline" size={18} color={colors.textPrimary} />
            <Text style={[styles.toolBtnText, { color: colors.textPrimary }]}>Track</Text>
          </TouchableOpacity>
        </View>

        {/* Official Notification Document Link */}
        {opportunity.officialNotificationUrl && (
          <TouchableOpacity
            style={[styles.docBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handleOpenUrl(opportunity.officialNotificationUrl, 'Official Notification')}
          >
            <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            <Text style={[styles.docBtnText, { color: colors.primary }]}>View Official Notification (PDF / Notice)</Text>
            <Ionicons name="open-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Persistent Bottom Sticky Action Bar: Official Apply Button */}
      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.applyOfficialBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
          onPress={() =>
            handleOpenUrl(
              opportunity.officialApplicationUrl || opportunity.officialSourceUrl,
              'Official Application Portal'
            )
          }
        >
          <Text style={styles.applyOfficialText}>Apply on Official Website</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Reminder Modal */}
      <ReminderModal
        visible={reminderModalVisible}
        opportunityId={opportunity.id}
        opportunityTitle={opportunity.title}
        organization={opportunity.organization}
        deadlineDateStr={opportunity.applicationDeadline}
        onClose={() => setReminderModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  deadlineBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deadlineBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 6,
  },
  org: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 14,
  },
  verifiedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  verifiedTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  verifiedSub: {
    fontSize: 11,
    marginTop: 1,
  },
  factsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 14,
    marginBottom: 16,
  },
  factItem: {
    width: '47%',
  },
  factLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  factValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 20,
  },
  reqBlock: {
    marginBottom: 10,
  },
  reqLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  reqValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 6,
  },
  versionSummary: {
    fontSize: 13,
    fontWeight: '600',
  },
  versionDate: {
    fontSize: 11,
  },
  toolRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  toolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  toolBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  docBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  docBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  applyOfficialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  applyOfficialText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

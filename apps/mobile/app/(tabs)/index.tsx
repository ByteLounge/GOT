import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { OpportunityCard } from '../../components/OpportunityCard';
import { OfflineBanner } from '../../components/OfflineBanner';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { MobileApiService } from '../../services/api';
import { Opportunity } from '@govalert/types';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useThemeStore();
  const { user, profile, isOnboarded } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const [forYou, setForYou] = useState<Opportunity[]>([]);
  const [closingSoon, setClosingSoon] = useState<Opportunity[]>([]);
  const [newlyAdded, setNewlyAdded] = useState<Opportunity[]>([]);
  const [scholarships, setScholarships] = useState<Opportunity[]>([]);
  const [govJobs, setGovJobs] = useState<Opportunity[]>([]);
  const [internships, setInternships] = useState<Opportunity[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<Opportunity[]>([]);

  const loadDashboardData = async () => {
    try {
      const [recRes, allRes] = await Promise.all([
        MobileApiService.getRecommendations(),
        MobileApiService.getOpportunities({ limit: 40 }),
      ]);

      setIsOffline(recRes.isOffline || allRes.isOffline);

      const all = allRes.data.data;
      setForYou(recRes.data.recommendations || all.slice(0, 4));

      // Closing Soon (deadline within 7 days, open status)
      const urgent = all
        .filter(o => o.daysRemaining != null && o.daysRemaining > 0 && o.daysRemaining <= 10)
        .sort((a, b) => (a.daysRemaining || 99) - (b.daysRemaining || 99));
      setClosingSoon(urgent.slice(0, 5));

      // Newly Added
      const newest = [...all].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNewlyAdded(newest.slice(0, 5));

      // Scholarships
      setScholarships(all.filter(o => o.category === 'Scholarships').slice(0, 4));

      // Government Jobs
      setGovJobs(all.filter(o => o.category === 'Government Jobs').slice(0, 4));

      // Internships & Fellowships
      setInternships(
        all.filter(o => o.category === 'Government Internships' || o.category === 'Fellowships').slice(0, 4)
      );

      // Upcoming Exams
      setUpcomingExams(all.filter(o => o.category === 'Competitive Exams').slice(0, 4));
    } catch (err) {
      console.warn('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, []);

  const renderSectionHeader = (title: string, icon: any, onSeeAll?: () => void) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name={icon} size={18} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
      </View>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} style={styles.seeAllBtn}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>View All</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      <OfflineBanner visible={isOffline} />

      {loading ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Loading verified opportunities...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Banner */}
          <View style={[styles.welcomeCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.welcomeGreeting, { color: colors.textSecondary }]}>
                {user ? `Namaste, ${profile?.name || 'Aspirant'}` : 'Welcome to GovAlert'}
              </Text>
              <Text style={[styles.welcomeHeadline, { color: colors.textPrimary }]}>
                Verified Government Openings & Scholarships
              </Text>
              <Text style={[styles.welcomeSub, { color: colors.textMuted }]}>
                Direct from official portals. Zero fake alerts.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.profileSetupBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push(user ? '/(tabs)/profile' : '/auth/login')}
            >
              <Text style={styles.profileSetupText}>{user ? 'Profile' : 'Sign In'}</Text>
            </TouchableOpacity>
          </View>

          {/* For You */}
          {forYou.length > 0 && (
            <View style={styles.section}>
              {renderSectionHeader('For You (Personalized)', 'sparkles-outline', () => router.push('/(tabs)/discover'))}
              {forYou.map(opp => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  onPress={() => router.push(`/opportunity/${opp.id}`)}
                />
              ))}
            </View>
          )}

          {/* Closing Soon */}
          {closingSoon.length > 0 && (
            <View style={styles.section}>
              {renderSectionHeader('Closing Soon', 'alarm-outline', () => router.push('/(tabs)/discover'))}
              {closingSoon.map(opp => (
                <OpportunityCard
                  key={`cs-${opp.id}`}
                  opportunity={opp}
                  onPress={() => router.push(`/opportunity/${opp.id}`)}
                />
              ))}
            </View>
          )}

          {/* Scholarships */}
          {scholarships.length > 0 && (
            <View style={styles.section}>
              {renderSectionHeader('Scholarships & Grants', 'school-outline', () => router.push('/(tabs)/discover'))}
              {scholarships.map(opp => (
                <OpportunityCard
                  key={`sch-${opp.id}`}
                  opportunity={opp}
                  onPress={() => router.push(`/opportunity/${opp.id}`)}
                />
              ))}
            </View>
          )}

          {/* Government Jobs */}
          {govJobs.length > 0 && (
            <View style={styles.section}>
              {renderSectionHeader('Government Recruitments', 'briefcase-outline', () => router.push('/(tabs)/discover'))}
              {govJobs.map(opp => (
                <OpportunityCard
                  key={`job-${opp.id}`}
                  opportunity={opp}
                  onPress={() => router.push(`/opportunity/${opp.id}`)}
                />
              ))}
            </View>
          )}

          {/* Internships & Fellowships */}
          {internships.length > 0 && (
            <View style={styles.section}>
              {renderSectionHeader('Internships & Fellowships', 'ribbon-outline', () => router.push('/(tabs)/discover'))}
              {internships.map(opp => (
                <OpportunityCard
                  key={`int-${opp.id}`}
                  opportunity={opp}
                  onPress={() => router.push(`/opportunity/${opp.id}`)}
                />
              ))}
            </View>
          )}

          {/* Upcoming Exams */}
          {upcomingExams.length > 0 && (
            <View style={styles.section}>
              {renderSectionHeader('Upcoming Examinations', 'calendar-outline', () => router.push('/(tabs)/discover'))}
              {upcomingExams.map(opp => (
                <OpportunityCard
                  key={`ex-${opp.id}`}
                  opportunity={opp}
                  onPress={() => router.push(`/opportunity/${opp.id}`)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
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
    paddingBottom: 40,
  },
  loaderCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
  },
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  welcomeGreeting: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  welcomeHeadline: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 4,
  },
  welcomeSub: {
    fontSize: 12,
  },
  profileSetupBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  profileSetupText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

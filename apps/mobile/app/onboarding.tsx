import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { EDUCATION_LEVELS, INDIAN_STATES, OPPORTUNITY_CATEGORIES } from '@govalert/shared';

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useThemeStore();
  const { setOnboarded, updateProfile } = useAuthStore();

  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Government Jobs', 'Scholarships']);
  const [selectedEducation, setSelectedEducation] = useState<string>('Undergraduate / Bachelor Degree');
  const [selectedState, setSelectedState] = useState<string>('All India');

  const toggleInterest = (cat: string) => {
    if (selectedInterests.includes(cat)) {
      setSelectedInterests(selectedInterests.filter(i => i !== cat));
    } else {
      setSelectedInterests([...selectedInterests, cat]);
    }
  };

  const handleFinish = async () => {
    await updateProfile({
      preferredOpportunityTypes: selectedInterests as any,
      educationLevel: selectedEducation,
      state: selectedState,
    });
    await setOnboarded(true);
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top step progress & Skip */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.stepIndicator}>
          {[1, 2, 3, 4].map(s => (
            <View
              key={s}
              style={[
                styles.stepDot,
                { backgroundColor: s <= step ? colors.primary : colors.border },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity onPress={handleFinish} style={styles.skipBtn}>
          <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Step 1: What are you looking for? */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>What are you looking for?</Text>
            <Text style={[styles.stepSub, { color: colors.textSecondary }]}>
              Select the public sector opportunities you wish to track.
            </Text>

            <View style={styles.chipGrid}>
              {OPPORTUNITY_CATEGORIES.slice(0, 8).map(cat => {
                const isSelected = selectedInterests.includes(cat);
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => toggleInterest(cat)}
                  >
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                      size={18}
                      color={isSelected ? '#FFFFFF' : colors.textPrimary}
                    />
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
        )}

        {/* Step 2: What's your education? */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>What's your education?</Text>
            <Text style={[styles.stepSub, { color: colors.textSecondary }]}>
              Used to calculate preliminary eligibility matches.
            </Text>

            <View style={styles.verticalList}>
              {EDUCATION_LEVELS.map(edu => {
                const isSelected = selectedEducation === edu;
                return (
                  <TouchableOpacity
                    key={edu}
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: isSelected
                          ? colors.isDark ? '#1E293B' : '#EFF6FF'
                          : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedEducation(edu)}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={isSelected ? colors.primary : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.optionCardText,
                        { color: isSelected ? colors.primary : colors.textPrimary, fontWeight: isSelected ? '700' : '500' },
                      ]}
                    >
                      {edu}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Step 3: Where are you interested? */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Where are you interested?</Text>
            <Text style={[styles.stepSub, { color: colors.textSecondary }]}>
              Filter notifications by state or All-India cadres.
            </Text>

            <View style={styles.chipGrid}>
              {INDIAN_STATES.slice(0, 15).map(st => {
                const isSelected = selectedState === st;
                return (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedState(st)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary, fontWeight: isSelected ? '700' : '500' },
                      ]}
                    >
                      {st}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Step 4: Ready! */}
        {step === 4 && (
          <View style={[styles.stepContainer, { alignItems: 'center', paddingTop: 30 }]}>
            <View style={[styles.readyCircle, { backgroundColor: colors.surfaceVariant }]}>
              <Ionicons name="checkmark-done" size={48} color={colors.success} />
            </View>
            <Text style={[styles.stepTitle, { color: colors.textPrimary, textAlign: 'center' }]}>
              You're Ready!
            </Text>
            <Text style={[styles.stepSub, { color: colors.textSecondary, textAlign: 'center', lineHeight: 20 }]}>
              GovAlert is configured to personalize verified government recruitments, scholarships, and reminders.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {step > 1 && (
          <TouchableOpacity
            style={[styles.navBtn, { borderColor: colors.border }]}
            onPress={() => setStep(step - 1)}
          >
            <Text style={[styles.navBtnText, { color: colors.textSecondary }]}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            if (step < 4) {
              setStep(step + 1);
            } else {
              handleFinish();
            }
          }}
        >
          <Text style={styles.nextBtnText}>{step === 4 ? 'Go to Dashboard' : 'Next'}</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 24,
    height: 4,
    borderRadius: 2,
  },
  skipBtn: {
    padding: 4,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  stepContainer: {
    paddingTop: 10,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  stepSub: {
    fontSize: 13,
    marginBottom: 24,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
  },
  verticalList: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionCardText: {
    fontSize: 14,
  },
  readyCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    gap: 12,
  },
  navBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

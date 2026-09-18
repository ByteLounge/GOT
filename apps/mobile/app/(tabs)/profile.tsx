import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { EDUCATION_LEVELS, INDIAN_STATES, SOCIAL_CATEGORIES } from '@govalert/shared';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useThemeStore();
  const { user, profile, updateProfile, logout } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || user?.name || '');
  const [degree, setDegree] = useState(profile?.degree || '');
  const [branch, setBranch] = useState(profile?.branch || '');
  const [educationLevel, setEducationLevel] = useState(profile?.educationLevel || '');
  const [college, setCollege] = useState(profile?.college || '');
  const [state, setState] = useState(profile?.state || 'All India');
  const [category, setCategory] = useState(profile?.category || 'General / Unreserved');
  const [dob, setDob] = useState(profile?.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '');

  // Notification Preferences
  const [dailyMax, setDailyMax] = useState('5');
  const [quietHours, setQuietHours] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [newOppAlerts, setNewOppAlerts] = useState(true);
  const [examAlerts, setExamAlerts] = useState(true);

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        name,
        degree,
        branch,
        educationLevel,
        college,
        state,
        category,
        dateOfBirth: dob ? new Date(dob).toISOString() : null,
      });
      setIsEditing(false);
      Alert.alert('Profile Saved', 'Your profile details and eligibility criteria have been updated.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update profile');
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Profile & Settings" subtitle="Personalize eligibility & alerts" showSearch={false} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {(name || 'A').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{name || 'Aspirant'}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              {user?.email || 'Guest User'}
            </Text>
            <Text style={[styles.statusBadge, { color: colors.success }]}>
              ✓ Profile active for matching
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.editToggleBtn, { backgroundColor: colors.surfaceVariant }]}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Ionicons name={isEditing ? 'close' : 'pencil'} size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Form / Details */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Education & Eligibility</Text>

          {isEditing ? (
            <View style={styles.form}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.textPrimary, borderColor: colors.border }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter full name"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Degree / Qualification</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.textPrimary, borderColor: colors.border }]}
                value={degree}
                onChangeText={setDegree}
                placeholder="e.g. B.Tech, B.E., B.Sc, BCA, Diploma"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Branch / Specialization</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.textPrimary, borderColor: colors.border }]}
                value={branch}
                onChangeText={setBranch}
                placeholder="e.g. Computer Science, Mechanical, Civil"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>College / University</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.textPrimary, borderColor: colors.border }]}
                value={college}
                onChangeText={setCollege}
                placeholder="College name"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Date of Birth (YYYY-MM-DD)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.textPrimary, borderColor: colors.border }]}
                value={dob}
                onChangeText={setDob}
                placeholder="2002-05-15"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Home State</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.textPrimary, borderColor: colors.border }]}
                value={state}
                onChangeText={setState}
                placeholder="e.g. Maharashtra, Karnataka, Delhi"
                placeholderTextColor={colors.textMuted}
              />

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveBtnText}>Save Profile</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.detailsList}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: colors.textMuted }]}>Degree</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{degree || 'Not specified'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: colors.textMuted }]}>Branch</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{branch || 'Not specified'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: colors.textMuted }]}>College</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{college || 'Not specified'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: colors.textMuted }]}>Date of Birth</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{dob || 'Not specified'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: colors.textMuted }]}>State</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{state || 'All India'}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Notification Anti-Spam Controls */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Anti-Spam Notification Controls</Text>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>Deadline Reminders</Text>
              <Text style={[styles.switchSub, { color: colors.textMuted }]}>Alerts 7d, 3d, 1d before deadlines</Text>
            </View>
            <Switch value={deadlineAlerts} onValueChange={setDeadlineAlerts} trackColor={{ true: colors.primary }} />
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>New Matched Opportunities</Text>
              <Text style={[styles.switchSub, { color: colors.textMuted }]}>Digest when high-match openings appear</Text>
            </View>
            <Switch value={newOppAlerts} onValueChange={setNewOppAlerts} trackColor={{ true: colors.primary }} />
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>Quiet Hours (10 PM – 7 AM)</Text>
              <Text style={[styles.switchSub, { color: colors.textMuted }]}>Silence all non-urgent alerts overnight</Text>
            </View>
            <Switch value={quietHours} onValueChange={setQuietHours} trackColor={{ true: colors.primary }} />
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailKey, { color: colors.textMuted }]}>Daily Alert Cap</Text>
            <Text style={[styles.detailValue, { color: colors.primary, fontWeight: '700' }]}>Max 5 / day</Text>
          </View>
        </View>

        {/* App Settings */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Preferences & System</Text>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>Dark Mode</Text>
              <Text style={[styles.switchSub, { color: colors.textMuted }]}>Toggle high contrast theme</Text>
            </View>
            <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: colors.primary }} />
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailKey, { color: colors.textMuted }]}>Official Source First</Text>
            <Text style={[styles.detailValue, { color: colors.success }]}>Enforced</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailKey, { color: colors.textMuted }]}>App Version</Text>
            <Text style={[styles.detailValue, { color: colors.textSecondary }]}>v1.0.0 (Production Release)</Text>
          </View>
        </View>

        {/* Sign In / Sign Out Button */}
        <TouchableOpacity
          style={[styles.authActionBtn, { borderColor: user ? colors.danger : colors.primary }]}
          onPress={user ? handleLogout : () => router.push('/auth/login')}
        >
          <Ionicons
            name={user ? 'log-out-outline' : 'log-in-outline'}
            size={18}
            color={user ? colors.danger : colors.primary}
          />
          <Text style={[styles.authActionText, { color: user ? colors.danger : colors.primary }]}>
            {user ? 'Sign Out' : 'Sign In / Register'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 12,
    marginBottom: 4,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: '600',
  },
  editToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  form: {
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
  },
  saveBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  detailsList: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailKey: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  switchSub: {
    fontSize: 11,
  },
  authActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 20,
  },
  authActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../stores/themeStore';
import { MobileApiService } from '../services/api';
import { LocalNotificationService } from '../services/notifications';

interface Props {
  visible: boolean;
  opportunityId: string;
  opportunityTitle: string;
  organization: string;
  deadlineDateStr?: string | null;
  onClose: () => void;
}

const REMINDER_OPTIONS = [
  { days: 30, label: '30 days before' },
  { days: 14, label: '14 days before' },
  { days: 7, label: '7 days before' },
  { days: 3, label: '3 days before' },
  { days: 1, label: '1 day before' },
  { days: 0, label: 'On deadline day (8:00 AM)' },
];

export const ReminderModal: React.FC<Props> = ({
  visible,
  opportunityId,
  opportunityTitle,
  organization,
  deadlineDateStr,
  onClose,
}) => {
  const { colors } = useThemeStore();
  const [selectedDays, setSelectedDays] = useState<number[]>([7, 1]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleOption = (days: number) => {
    if (selectedDays.includes(days)) {
      setSelectedDays(selectedDays.filter(d => d !== days));
    } else {
      setSelectedDays([...selectedDays, days]);
    }
  };

  const handleSaveReminders = async () => {
    if (!deadlineDateStr) {
      Alert.alert('No Confirmed Deadline', 'This opportunity does not currently have a set deadline date.');
      return;
    }

    setIsSaving(true);
    try {
      const deadlineDate = new Date(deadlineDateStr);

      for (const days of selectedDays) {
        // 1. Persist to backend
        try {
          await MobileApiService.createReminder(opportunityId, days, 'deadline');
        } catch {}

        // 2. Schedule local notification
        const reminderDate = new Date(deadlineDate.getTime() - days * 24 * 60 * 60 * 1000);
        if (reminderDate.getTime() > Date.now()) {
          await LocalNotificationService.scheduleOpportunityReminder(
            opportunityId,
            opportunityTitle,
            organization,
            reminderDate,
            days
          );
        }
      }

      Alert.alert(
        'Reminders Set',
        `You will be notified:\n${selectedDays.map(d => `• ${d === 0 ? 'On deadline day' : `${d} days before`}`).join('\n')}`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not schedule reminders.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="notifications-outline" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Set Deadline Reminders</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                {opportunityTitle}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.instruction, { color: colors.textSecondary }]}>
            Select when you would like to be alerted before the application window closes:
          </Text>

          <View style={styles.optionsList}>
            {REMINDER_OPTIONS.map(opt => {
              const isSelected = selectedDays.includes(opt.days);
              return (
                <TouchableOpacity
                  key={opt.days}
                  style={[
                    styles.optionRow,
                    {
                      backgroundColor: isSelected
                        ? colors.isDark ? '#1E293B' : '#EFF6FF'
                        : colors.surfaceVariant,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => toggleOption(opt.days)}
                >
                  <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={isSelected ? colors.primary : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.optionLabel,
                      { color: isSelected ? colors.primary : colors.textPrimary, fontWeight: isSelected ? '700' : '500' },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSaveReminders}
              disabled={isSaving}
            >
              <Text style={styles.saveBtnText}>
                {isSaving ? 'Setting...' : 'Set Reminders'}
              </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
  },
  instruction: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  optionsList: {
    gap: 8,
    marginBottom: 18,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionLabel: {
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

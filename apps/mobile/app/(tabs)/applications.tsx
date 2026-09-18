import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useThemeStore } from '../../stores/themeStore';
import { useTrackerStore } from '../../stores/trackerStore';
import { ApplicationTrackingStatus, TrackedOpportunity } from '@govalert/types';
import { formatDateIndian } from '@govalert/shared';

const STATUS_LIST: ApplicationTrackingStatus[] = [
  'Interested',
  'Planning to Apply',
  'Applied',
  'Exam Scheduled',
  'Interview',
  'Selected',
  'Rejected',
  'Closed',
];

export default function ApplicationsScreen() {
  const router = useRouter();
  const { colors } = useThemeStore();
  const { trackedList, updateStatus, removeTracked } = useTrackerStore();

  const [activeTab, setActiveTab] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<TrackedOpportunity | null>(null);
  const [editStatus, setEditStatus] = useState<ApplicationTrackingStatus>('Applied');
  const [editNotes, setEditNotes] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const filtered = activeTab === 'All'
    ? trackedList
    : trackedList.filter(t => t.status === activeTab);

  const openEditModal = (item: TrackedOpportunity) => {
    setSelectedItem(item);
    setEditStatus(item.status);
    setEditNotes(item.notes || '');
    setModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;
    await updateStatus(selectedItem.id, editStatus, editNotes);
    setModalVisible(false);
    Alert.alert('Status Updated', `Application marked as "${editStatus}".`);
  };

  const getStatusColor = (status: ApplicationTrackingStatus) => {
    switch (status) {
      case 'Selected':
        return colors.success;
      case 'Applied':
      case 'Exam Scheduled':
      case 'Interview':
        return colors.primary;
      case 'Rejected':
      case 'Closed':
        return colors.textMuted;
      default:
        return colors.warning;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Applications" subtitle="Track your recruitment & scholarship milestones" />

      {/* Status filter bar */}
      <View style={[styles.filterBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <FlatList
          data={['All', ...STATUS_LIST]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          contentContainerStyle={styles.filterScroll}
          renderItem={({ item }) => {
            const isSelected = activeTab === item;
            return (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setActiveTab(item)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary, fontWeight: isSelected ? '700' : '500' },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Main List */}
      {trackedList.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surfaceVariant }]}>
            <Ionicons name="briefcase-outline" size={40} color={colors.textMuted} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Applications Tracked Yet</Text>
          <Text style={[styles.subText, { color: colors.textSecondary }]}>
            Mark opportunities as Applied, Exam Scheduled, or Planning to Apply from the opportunity detail page to track your pipeline.
          </Text>
          <TouchableOpacity
            style={[styles.exploreBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/discover')}
          >
            <Text style={styles.exploreBtnText}>Browse Openings</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const opp = item.opportunity;
            const statusColor = getStatusColor(item.status);

            return (
              <View
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusBadgeText, { color: statusColor }]}>{item.status}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => openEditModal(item)}
                    style={styles.editBtn}
                  >
                    <Ionicons name="create-outline" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>

                {opp ? (
                  <TouchableOpacity onPress={() => router.push(`/opportunity/${opp.id}`)}>
                    <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
                      {opp.title}
                    </Text>
                    <Text style={[styles.org, { color: colors.textSecondary }]}>
                      {opp.organization}
                    </Text>

                    {opp.applicationDeadline && (
                      <Text style={[styles.dateText, { color: colors.textMuted }]}>
                        Deadline: {formatDateIndian(opp.applicationDeadline)}
                      </Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.title, { color: colors.textPrimary }]}>
                    Tracked Opportunity ({item.opportunityId})
                  </Text>
                )}

                {item.notes ? (
                  <View style={[styles.notesBox, { backgroundColor: colors.surfaceVariant }]}>
                    <Text style={[styles.notesText, { color: colors.textSecondary }]}>
                      {item.notes}
                    </Text>
                  </View>
                ) : null}

                <View style={[styles.cardFooter, { borderTopColor: colors.cardBorder }]}>
                  <Text style={[styles.updatedAt, { color: colors.textMuted }]}>
                    Updated: {new Date(item.updatedAt).toLocaleDateString('en-IN')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('Remove Tracking', 'Remove this application from tracker?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Remove', style: 'destructive', onPress: () => removeTracked(item.id) },
                      ]);
                    }}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Edit Status & Notes Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Update Application Status</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Status</Text>
            <View style={styles.statusGrid}>
              {STATUS_LIST.map(st => {
                const isSelected = editStatus === st;
                return (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.statusSelectChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setEditStatus(st)}
                  >
                    <Text
                      style={[
                        styles.statusSelectText,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary, fontWeight: isSelected ? '700' : '500' },
                      ]}
                    >
                      {st}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Personal Notes / Registration No.</Text>
            <TextInput
              style={[
                styles.notesInput,
                { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.textPrimary },
              ]}
              placeholder="e.g. Applied on Sept 18th. Roll number: ISRO-88219"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              value={editNotes}
              onChangeText={setEditNotes}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveBtnText}>Save Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  editBtn: {
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
    marginBottom: 6,
  },
  dateText: {
    fontSize: 12,
    marginBottom: 8,
  },
  notesBox: {
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  notesText: {
    fontSize: 12,
    lineHeight: 17,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  updatedAt: {
    fontSize: 11,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    gap: 12,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  subText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  exploreBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  statusSelectChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusSelectText: {
    fontSize: 12,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalActions: {
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

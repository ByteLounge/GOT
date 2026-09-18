import { create } from 'zustand';
import { TrackedOpportunity, ApplicationTrackingStatus } from '@govalert/types';
import { MobileApiService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TrackerState {
  trackedList: TrackedOpportunity[];
  isLoading: boolean;

  fetchTracked: () => Promise<void>;
  track: (opportunityId: string, status: ApplicationTrackingStatus, notes?: string) => Promise<void>;
  updateStatus: (id: string, status?: ApplicationTrackingStatus, notes?: string) => Promise<void>;
  removeTracked: (id: string) => Promise<void>;
}

export const useTrackerStore = create<TrackerState>((set, get) => ({
  trackedList: [],
  isLoading: false,

  fetchTracked: async () => {
    set({ isLoading: true });
    try {
      const res = await MobileApiService.getTracked();
      set({ trackedList: res.data.tracked, isLoading: false });
      await AsyncStorage.setItem('@govalert_tracked_cache', JSON.stringify(res.data.tracked));
    } catch {
      const cached = await AsyncStorage.getItem('@govalert_tracked_cache');
      if (cached) {
        set({ trackedList: JSON.parse(cached), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    }
  },

  track: async (opportunityId: string, status: ApplicationTrackingStatus, notes?: string) => {
    try {
      const res = await MobileApiService.trackOpportunity(opportunityId, status, notes);
      const updated = [res.tracked, ...get().trackedList.filter(t => t.opportunityId !== opportunityId)];
      set({ trackedList: updated });
      await AsyncStorage.setItem('@govalert_tracked_cache', JSON.stringify(updated));
    } catch (err) {
      console.error('Track error:', err);
    }
  },

  updateStatus: async (id: string, status?: ApplicationTrackingStatus, notes?: string) => {
    try {
      const res = await MobileApiService.updateTrackedOpportunity(id, status, notes);
      const updated = get().trackedList.map(t => t.id === id ? res.tracked : t);
      set({ trackedList: updated });
      await AsyncStorage.setItem('@govalert_tracked_cache', JSON.stringify(updated));
    } catch (err) {
      console.error('Update tracker error:', err);
    }
  },

  removeTracked: async (id: string) => {
    try {
      const updated = get().trackedList.filter(t => t.id !== id);
      set({ trackedList: updated });
      await AsyncStorage.setItem('@govalert_tracked_cache', JSON.stringify(updated));
      await MobileApiService.removeTrackedOpportunity(id);
    } catch (err) {
      console.error('Remove tracked error:', err);
    }
  },
}));

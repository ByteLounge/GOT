import { create } from 'zustand';
import { Opportunity } from '@govalert/types';
import { MobileApiService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SavedState {
  savedList: Opportunity[];
  savedIds: Set<string>;
  isLoading: boolean;

  fetchSaved: () => Promise<void>;
  toggleSave: (opportunity: Opportunity) => Promise<boolean>;
  isSaved: (opportunityId: string) => boolean;
}

export const useSavedStore = create<SavedState>((set, get) => ({
  savedList: [],
  savedIds: new Set<string>(),
  isLoading: false,

  fetchSaved: async () => {
    set({ isLoading: true });
    try {
      const res = await MobileApiService.getSaved();
      const opps = res.data.saved.map(s => s.opportunity).filter(Boolean) as Opportunity[];
      set({
        savedList: opps,
        savedIds: new Set(opps.map(o => o.id)),
        isLoading: false,
      });
      await AsyncStorage.setItem('@govalert_saved_cache', JSON.stringify(opps));
    } catch {
      // Load offline cache
      const cached = await AsyncStorage.getItem('@govalert_saved_cache');
      if (cached) {
        const opps: Opportunity[] = JSON.parse(cached);
        set({
          savedList: opps,
          savedIds: new Set(opps.map(o => o.id)),
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    }
  },

  toggleSave: async (opportunity: Opportunity) => {
    const { savedIds, savedList } = get();
    const isCurrentlySaved = savedIds.has(opportunity.id);

    if (isCurrentlySaved) {
      // Optimistic removal
      const nextIds = new Set(savedIds);
      nextIds.delete(opportunity.id);
      const nextList = savedList.filter(o => o.id !== opportunity.id);
      set({ savedIds: nextIds, savedList: nextList });
      await AsyncStorage.setItem('@govalert_saved_cache', JSON.stringify(nextList));

      try {
        await MobileApiService.removeSavedOpportunity(opportunity.id);
      } catch (err) {
        console.warn('Failed to remove save on server:', err);
      }
      return false;
    } else {
      // Optimistic addition
      const nextIds = new Set(savedIds);
      nextIds.add(opportunity.id);
      const nextList = [opportunity, ...savedList];
      set({ savedIds: nextIds, savedList: nextList });
      await AsyncStorage.setItem('@govalert_saved_cache', JSON.stringify(nextList));

      try {
        await MobileApiService.saveOpportunity(opportunity.id);
      } catch (err) {
        console.warn('Failed to persist save on server:', err);
      }
      return true;
    }
  },

  isSaved: (opportunityId: string) => {
    return get().savedIds.has(opportunityId);
  },
}));

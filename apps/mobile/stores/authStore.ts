import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '@govalert/types';
import { MobileApiService } from '../services/api';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { id: string; email: string; name?: string } | null;
  profile: UserProfile | null;
  isOnboarded: boolean;

  init: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  setOnboarded: (val: boolean) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  profile: null,
  isOnboarded: false,

  init: async () => {
    try {
      const token = await AsyncStorage.getItem('@govalert_token');
      const userStr = await AsyncStorage.getItem('@govalert_user');
      const profileStr = await AsyncStorage.getItem('@govalert_profile');
      const onboardedStr = await AsyncStorage.getItem('@govalert_onboarded');

      if (token && userStr) {
        set({
          isAuthenticated: true,
          user: JSON.parse(userStr),
          profile: profileStr ? JSON.parse(profileStr) : null,
          isOnboarded: onboardedStr === 'true',
          isLoading: false,
        });
      } else {
        set({ isLoading: false, isOnboarded: onboardedStr === 'true' });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  login: async (email: string, pass: string) => {
    const res = await MobileApiService.login(email, pass);
    set({
      isAuthenticated: true,
      user: res.user,
      profile: res.profile,
    });
  },

  register: async (email: string, pass: string, name: string) => {
    const res = await MobileApiService.register(email, pass, name);
    set({
      isAuthenticated: true,
      user: res.user,
      profile: res.profile,
    });
  },

  logout: async () => {
    await MobileApiService.setToken(null);
    await AsyncStorage.removeItem('@govalert_user');
    await AsyncStorage.removeItem('@govalert_profile');
    set({
      isAuthenticated: false,
      user: null,
      profile: null,
    });
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    const res = await MobileApiService.updateProfile(updates);
    set({ profile: res.profile });
  },

  setOnboarded: async (val: boolean) => {
    await AsyncStorage.setItem('@govalert_onboarded', val ? 'true' : 'false');
    set({ isOnboarded: val });
  },
}));

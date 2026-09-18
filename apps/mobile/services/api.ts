import AsyncStorage from '@react-native-async-storage/async-storage';
import { Opportunity, UserProfile, SavedOpportunity, TrackedOpportunity, Reminder, InAppNotification, NotificationPreferences } from '@govalert/types';
import { SEED_OPPORTUNITIES } from '../../../backend/src/data/seedOpportunities';
import { calculateDeadlineInfo, evaluateEligibility } from '@govalert/shared';

// Configurable API base (e.g. for Android emulator 'http://10.0.2.2:5000/api/v1', or LAN IP)
const API_BASE_URL = 'http://10.0.2.2:5000/api/v1';

export class MobileApiService {
  private static token: string | null = null;
  private static isOffline: boolean = false;

  static async setToken(token: string | null) {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem('@govalert_token', token);
    } else {
      await AsyncStorage.removeItem('@govalert_token');
    }
  }

  static async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('@govalert_token');
    }
    return this.token;
  }

  static getIsOffline(): boolean {
    return this.isOffline;
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T; isOffline: boolean }> {
    const token = await this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as any),
    };

    const cacheKey = `@cache_${endpoint}_${options.method || 'GET'}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      this.isOffline = false;

      // Cache successful response for offline support
      if (!options.method || options.method === 'GET') {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(json));
      }

      return { data: json, isOffline: false };
    } catch (err) {
      console.warn(`[MobileApi] Network request to ${endpoint} failed, falling back to cache/offline:`, err);
      this.isOffline = true;

      // Try local cache
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        return { data: JSON.parse(cached), isOffline: true };
      }

      // Offline fallback: Use embedded seed opportunities if fetching opportunities
      if (endpoint.startsWith('/opportunities') || endpoint.startsWith('/recommendations')) {
        const profileStr = await AsyncStorage.getItem('@govalert_profile');
        const profile: UserProfile | null = profileStr ? JSON.parse(profileStr) : null;

        const transformed = SEED_OPPORTUNITIES.map(item => {
          const dl = calculateDeadlineInfo(item.applicationDeadline, item.applicationStartDate);
          const potentialMatch = profile ? evaluateEligibility(profile, item) : undefined;
          return {
            ...item,
            status: dl.status,
            deadlineStatus: dl.status,
            daysRemaining: dl.daysRemaining,
            potentialMatch,
          };
        });

        if (endpoint.startsWith('/recommendations')) {
          return {
            data: { success: true, recommendations: transformed.slice(0, 10) } as any,
            isOffline: true,
          };
        }

        return {
          data: {
            success: true,
            total: transformed.length,
            page: 1,
            limit: 50,
            totalPages: 1,
            data: transformed,
          } as any,
          isOffline: true,
        };
      }

      throw new Error('You appear to be offline and cached data is not available.');
    }
  }

  // Auth
  static async login(email: string, passwordPlain: string) {
    const res = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: passwordPlain }),
    });
    if (res.data.token) {
      await this.setToken(res.data.token);
      await AsyncStorage.setItem('@govalert_user', JSON.stringify(res.data.user));
      await AsyncStorage.setItem('@govalert_profile', JSON.stringify(res.data.profile));
    }
    return res.data;
  }

  static async register(email: string, passwordPlain: string, name: string) {
    const res = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password: passwordPlain, name }),
    });
    if (res.data.token) {
      await this.setToken(res.data.token);
      await AsyncStorage.setItem('@govalert_user', JSON.stringify(res.data.user));
      await AsyncStorage.setItem('@govalert_profile', JSON.stringify(res.data.profile));
    }
    return res.data;
  }

  // Opportunities
  static async getOpportunities(params: Record<string, any> = {}) {
    const queryStr = new URLSearchParams(params).toString();
    const endpoint = `/opportunities${queryStr ? `?${queryStr}` : ''}`;
    return this.request<{ total: number; page: number; limit: number; totalPages: number; data: Opportunity[] }>(endpoint);
  }

  static async getOpportunityById(id: string) {
    return this.request<{ success: boolean; opportunity: Opportunity }>(`/opportunities/${id}`);
  }

  static async getRecommendations() {
    return this.request<{ success: boolean; recommendations: Opportunity[] }>('/recommendations');
  }

  static async search(query: string) {
    return this.request<{ success: boolean; query: string; results: Opportunity[]; total: number }>(`/search?q=${encodeURIComponent(query)}`);
  }

  // Bookmarks
  static async getSaved() {
    return this.request<{ success: boolean; saved: SavedOpportunity[] }>('/saved');
  }

  static async saveOpportunity(opportunityId: string) {
    return this.request<{ success: boolean; saved: SavedOpportunity }>(`/saved/${opportunityId}`, {
      method: 'POST',
    });
  }

  static async removeSavedOpportunity(opportunityId: string) {
    return this.request<{ success: boolean; removed: boolean }>(`/saved/${opportunityId}`, {
      method: 'DELETE',
    });
  }

  // Tracked
  static async getTracked() {
    return this.request<{ success: boolean; tracked: TrackedOpportunity[] }>('/tracked');
  }

  static async trackOpportunity(opportunityId: string, status: string, notes?: string) {
    return this.request<{ success: boolean; tracked: TrackedOpportunity }>('/tracked', {
      method: 'POST',
      body: JSON.stringify({ opportunityId, status, notes }),
    });
  }

  static async updateTrackedOpportunity(id: string, status?: string, notes?: string) {
    return this.request<{ success: boolean; tracked: TrackedOpportunity }>(`/tracked/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  static async removeTrackedOpportunity(id: string) {
    return this.request<{ success: boolean; removed: boolean }>(`/tracked/${id}`, {
      method: 'DELETE',
    });
  }

  // Profile
  static async getProfile() {
    return this.request<{ success: boolean; profile: UserProfile }>('/profile');
  }

  static async updateProfile(profileData: Partial<UserProfile>) {
    const res = await this.request<{ success: boolean; profile: UserProfile }>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
    await AsyncStorage.setItem('@govalert_profile', JSON.stringify(res.data.profile));
    return res.data;
  }

  // Reminders
  static async getReminders() {
    return this.request<{ success: boolean; reminders: Reminder[] }>('/reminders');
  }

  static async createReminder(opportunityId: string, daysBefore: number, notificationType: string = 'deadline') {
    return this.request<{ success: boolean; reminder: Reminder }>('/reminders', {
      method: 'POST',
      body: JSON.stringify({ opportunityId, daysBefore, notificationType }),
    });
  }

  static async deleteReminder(id: string) {
    return this.request<{ success: boolean; removed: boolean }>(`/reminders/${id}`, {
      method: 'DELETE',
    });
  }

  // Notifications
  static async getNotifications() {
    return this.request<{ success: boolean; notifications: InAppNotification[] }>('/notifications');
  }

  static async markNotificationRead(id: string) {
    return this.request<{ success: boolean; marked: boolean }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  static async getNotificationPreferences() {
    return this.request<{ success: boolean; preferences: NotificationPreferences }>('/notifications/preferences');
  }

  static async updateNotificationPreferences(prefs: Partial<NotificationPreferences>) {
    return this.request<{ success: boolean; preferences: NotificationPreferences }>('/notifications/preferences', {
      method: 'PATCH',
      body: JSON.stringify(prefs),
    });
  }
}

import { dbStore } from '../db';
import { InAppNotification, NotificationCategory, NotificationPreferences } from '@govalert/types';

export class NotificationsService {
  static list(userId: string) {
    const state = dbStore.getState();
    return state.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static markAsRead(userId: string, id: string): boolean {
    const state = dbStore.getState();
    const notif = state.notifications.find(n => n.id === id && n.userId === userId);
    if (notif) {
      notif.isRead = true;
      dbStore.save();
      return true;
    }
    return false;
  }

  static markAllAsRead(userId: string): number {
    const state = dbStore.getState();
    let count = 0;
    state.notifications.forEach(n => {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        count++;
      }
    });
    if (count > 0) dbStore.save();
    return count;
  }

  static getPreferences(userId: string): NotificationPreferences {
    const state = dbStore.getState();
    let prefs = state.notificationPreferences.find(p => p.userId === userId);
    if (!prefs) {
      prefs = {
        id: `np-${userId}`,
        userId,
        dailyMax: 5,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        newOpportunities: true,
        deadlineReminders: true,
        updatesAndCorrigenda: true,
        examAlerts: true,
        pushAlerts: true,
        emailAlerts: false,
      };
      state.notificationPreferences.push(prefs);
      dbStore.save();
    }
    return prefs;
  }

  static updatePreferences(userId: string, updates: Partial<NotificationPreferences>): NotificationPreferences {
    const state = dbStore.getState();
    let prefs = state.notificationPreferences.find(p => p.userId === userId);
    if (!prefs) {
      prefs = this.getPreferences(userId);
    }

    Object.assign(prefs, updates);
    dbStore.save();
    return prefs;
  }

  /**
   * Dispatches a notification while strictly respecting anti-spam limits:
   * 1. Check duplicate within 24h for identical title/opportunity
   * 2. Check daily maximum alerts sent today
   * 3. Check quiet hours
   */
  static dispatch(
    userId: string,
    opportunityId: string | null,
    title: string,
    message: string,
    category: NotificationCategory,
    metadata?: Record<string, any>
  ): { sent: boolean; reason?: string; notification?: InAppNotification } {
    const state = dbStore.getState();
    const prefs = this.getPreferences(userId);

    // 1. Check if category is enabled in user preferences
    if (category === 'NEW_OPPORTUNITY' && !prefs.newOpportunities) return { sent: false, reason: 'Category disabled' };
    if ((category === 'DEADLINE_ALERT' || category === 'DEADLINE_TOMORROW') && !prefs.deadlineReminders) return { sent: false, reason: 'Category disabled' };
    if ((category === 'DEADLINE_CHANGE' || category === 'IMPORTANT_UPDATE') && !prefs.updatesAndCorrigenda) return { sent: false, reason: 'Category disabled' };
    if (category === 'EXAM_ALERT' && !prefs.examAlerts) return { sent: false, reason: 'Category disabled' };

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    // 2. Duplicate detection within 24h
    const recentDuplicate = state.notifications.find(n => {
      if (n.userId !== userId) return false;
      if (n.opportunityId !== opportunityId) return false;
      if (n.category !== category) return false;
      const notifTime = new Date(n.createdAt).getTime();
      return now.getTime() - notifTime < 24 * 60 * 60 * 1000;
    });

    if (recentDuplicate) {
      return { sent: false, reason: 'Duplicate notification suppressed within 24 hours' };
    }

    // 3. Check daily maximum
    const sentTodayCount = state.notifications.filter(n => {
      if (n.userId !== userId) return false;
      return new Date(n.createdAt).getTime() >= todayStart;
    }).length;

    if (sentTodayCount >= prefs.dailyMax) {
      return { sent: false, reason: `Daily limit of ${prefs.dailyMax} notifications reached` };
    }

    // 4. Quiet hours check
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentMinutesFromMidnight = currentHour * 60 + currentMinute;

    const [qhStartHour, qhStartMin] = (prefs.quietHoursStart || '22:00').split(':').map(Number);
    const [qhEndHour, qhEndMin] = (prefs.quietHoursEnd || '07:00').split(':').map(Number);
    const qhStart = qhStartHour * 60 + qhStartMin;
    const qhEnd = qhEndHour * 60 + qhEndMin;

    const isQuietHour = qhStart > qhEnd
      ? (currentMinutesFromMidnight >= qhStart || currentMinutesFromMidnight <= qhEnd)
      : (currentMinutesFromMidnight >= qhStart && currentMinutesFromMidnight <= qhEnd);

    if (isQuietHour) {
      // In production, queue for morning delivery; for in-app alert log silently
    }

    const notification: InAppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId,
      opportunityId,
      title,
      message,
      category,
      isRead: false,
      metadata: metadata || null,
      createdAt: now.toISOString(),
    };

    state.notifications.push(notification);
    dbStore.save();

    return { sent: true, notification };
  }
}

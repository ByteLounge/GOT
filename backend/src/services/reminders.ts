import { dbStore } from '../db';
import { Reminder } from '@govalert/types';
import { OpportunityService } from './opportunities';

export class RemindersService {
  static list(userId: string) {
    const state = dbStore.getState();
    const userProfile = state.profiles.find(p => p.userId === userId);
    return state.reminders
      .filter(r => r.userId === userId)
      .map(r => ({
        ...r,
        opportunity: OpportunityService.getById(r.opportunityId, userProfile) || undefined,
      }));
  }

  static create(userId: string, opportunityId: string, daysBefore: number, notificationType: 'deadline' | 'exam' = 'deadline'): Reminder {
    const state = dbStore.getState();
    const opp = state.opportunities.find(o => o.id === opportunityId);
    if (!opp) throw new Error('Opportunity not found.');

    const targetDateStr = notificationType === 'exam' ? opp.examDate : opp.applicationDeadline;
    if (!targetDateStr) {
      throw new Error(`The selected opportunity does not have a confirmed ${notificationType} date.`);
    }

    const targetTime = new Date(targetDateStr).getTime();
    const reminderTime = targetTime - daysBefore * 24 * 60 * 60 * 1000;
    const reminderDate = new Date(reminderTime).toISOString();

    const existing = state.reminders.find(
      r => r.userId === userId && r.opportunityId === opportunityId && r.daysBefore === daysBefore && r.notificationType === notificationType
    );
    if (existing) return existing;

    const newReminder: Reminder = {
      id: `rem-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId,
      opportunityId,
      reminderDate,
      daysBefore,
      notificationType,
      isSent: false,
      createdAt: new Date().toISOString(),
    };

    state.reminders.push(newReminder);
    dbStore.save();
    return newReminder;
  }

  static remove(userId: string, id: string): boolean {
    const state = dbStore.getState();
    const initialLen = state.reminders.length;
    state.reminders = state.reminders.filter(r => !(r.id === id && r.userId === userId));
    const removed = state.reminders.length < initialLen;
    if (removed) dbStore.save();
    return removed;
  }
}

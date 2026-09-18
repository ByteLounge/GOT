import { dbStore } from '../db';
import { TrackedOpportunity, ApplicationTrackingStatus } from '@govalert/types';
import { OpportunityService } from './opportunities';

export class TrackerService {
  static list(userId: string) {
    const state = dbStore.getState();
    const userProfile = state.profiles.find(p => p.userId === userId);
    const tracked = state.trackedOpportunities.filter(t => t.userId === userId);

    return tracked.map(t => {
      const opp = OpportunityService.getById(t.opportunityId, userProfile);
      return {
        ...t,
        opportunity: opp || undefined,
      };
    });
  }

  static track(userId: string, opportunityId: string, status: ApplicationTrackingStatus, notes?: string | null): TrackedOpportunity {
    const state = dbStore.getState();
    const opp = state.opportunities.find(o => o.id === opportunityId);
    if (!opp) throw new Error('Opportunity not found.');

    const now = new Date().toISOString();
    const existing = state.trackedOpportunities.find(
      t => t.userId === userId && t.opportunityId === opportunityId
    );

    if (existing) {
      existing.status = status;
      if (notes !== undefined) existing.notes = notes;
      existing.updatedAt = now;
      dbStore.save();
      return existing;
    }

    const newRecord: TrackedOpportunity = {
      id: `trk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId,
      opportunityId,
      status,
      notes: notes || null,
      createdAt: now,
      updatedAt: now,
    };

    state.trackedOpportunities.push(newRecord);
    dbStore.save();
    return newRecord;
  }

  static update(userId: string, id: string, status?: ApplicationTrackingStatus, notes?: string | null): TrackedOpportunity {
    const state = dbStore.getState();
    const record = state.trackedOpportunities.find(t => t.id === id && t.userId === userId);
    if (!record) throw new Error('Tracked opportunity not found.');

    if (status) record.status = status;
    if (notes !== undefined) record.notes = notes;
    record.updatedAt = new Date().toISOString();

    dbStore.save();
    return record;
  }

  static remove(userId: string, id: string): boolean {
    const state = dbStore.getState();
    const initialLen = state.trackedOpportunities.length;
    state.trackedOpportunities = state.trackedOpportunities.filter(
      t => !(t.id === id && t.userId === userId)
    );
    const removed = state.trackedOpportunities.length < initialLen;
    if (removed) dbStore.save();
    return removed;
  }
}

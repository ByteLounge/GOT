import { dbStore } from '../db';
import { SavedOpportunity } from '@govalert/types';
import { OpportunityService } from './opportunities';

export class BookmarksService {
  static list(userId: string) {
    const state = dbStore.getState();
    const userProfile = state.profiles.find(p => p.userId === userId);
    const saved = state.savedOpportunities.filter(s => s.userId === userId);

    return saved.map(s => {
      const opp = OpportunityService.getById(s.opportunityId, userProfile);
      return {
        ...s,
        opportunity: opp || undefined,
      };
    }).filter(s => s.opportunity !== undefined);
  }

  static save(userId: string, opportunityId: string): SavedOpportunity {
    const state = dbStore.getState();
    const existing = state.savedOpportunities.find(
      s => s.userId === userId && s.opportunityId === opportunityId
    );
    if (existing) return existing;

    const opp = state.opportunities.find(o => o.id === opportunityId);
    if (!opp) throw new Error('Opportunity not found.');

    const newRecord: SavedOpportunity = {
      id: `sav-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId,
      opportunityId,
      createdAt: new Date().toISOString(),
    };

    state.savedOpportunities.push(newRecord);
    dbStore.save();
    return newRecord;
  }

  static remove(userId: string, opportunityId: string): boolean {
    const state = dbStore.getState();
    const initialLen = state.savedOpportunities.length;
    state.savedOpportunities = state.savedOpportunities.filter(
      s => !(s.userId === userId && s.opportunityId === opportunityId)
    );
    const removed = state.savedOpportunities.length < initialLen;
    if (removed) {
      dbStore.save();
    }
    return removed;
  }

  static isSaved(userId: string, opportunityId: string): boolean {
    const state = dbStore.getState();
    return state.savedOpportunities.some(
      s => s.userId === userId && s.opportunityId === opportunityId
    );
  }
}

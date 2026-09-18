import { dbStore } from '../db';
import { Opportunity, UserProfile } from '@govalert/types';
import { calculateDeadlineInfo, evaluateEligibility } from '@govalert/shared';

export interface OpportunityFilterOptions {
  page?: number;
  limit?: number;
  category?: string;
  education?: string;
  location?: string;
  status?: string;
  deadlineStatus?: string;
  organization?: string;
  search?: string;
  sort?: 'deadline_asc' | 'newest' | 'vacancies_desc';
}

export class OpportunityService {
  static list(filters: OpportunityFilterOptions = {}, userProfile?: UserProfile | null) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const state = dbStore.getState();

    let items = [...state.opportunities];

    // Filter by category
    if (filters.category && filters.category !== 'All') {
      items = items.filter(o => o.category.toLowerCase() === filters.category!.toLowerCase());
    }

    // Filter by organization
    if (filters.organization) {
      const orgQuery = filters.organization.toLowerCase();
      items = items.filter(o => o.organization.toLowerCase().includes(orgQuery));
    }

    // Filter by education
    if (filters.education && filters.education !== 'All') {
      const eduQuery = filters.education.toLowerCase();
      items = items.filter(o =>
        o.educationRequirements.some(req => req.toLowerCase().includes(eduQuery))
      );
    }

    // Filter by location
    if (filters.location && filters.location !== 'All' && filters.location !== 'All India') {
      const locQuery = filters.location.toLowerCase();
      items = items.filter(o =>
        o.location ? o.location.toLowerCase().includes(locQuery) || o.location === 'All India' : false
      );
    }

    // Filter by status / deadlineStatus
    if (filters.status) {
      items = items.filter(o => o.status === filters.status);
    }

    // Search query
    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(o => {
        return (
          o.title.toLowerCase().includes(q) ||
          o.organization.toLowerCase().includes(q) ||
          o.category.toLowerCase().includes(q) ||
          (o.location && o.location.toLowerCase().includes(q)) ||
          (o.description && o.description.toLowerCase().includes(q)) ||
          (o.shortDescription && o.shortDescription.toLowerCase().includes(q)) ||
          o.educationRequirements.some(e => e.toLowerCase().includes(q)) ||
          o.branchRequirements.some(b => b.toLowerCase().includes(q))
        );
      });
    }

    // Recalculate deadline states dynamically
    items = items.map(item => {
      const dl = calculateDeadlineInfo(item.applicationDeadline, item.applicationStartDate);
      const potentialMatch = userProfile ? evaluateEligibility(userProfile, item) : undefined;
      return {
        ...item,
        status: dl.status,
        deadlineStatus: dl.status,
        daysRemaining: dl.daysRemaining,
        potentialMatch,
      };
    });

    // Sorting
    if (filters.sort === 'newest') {
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (filters.sort === 'vacancies_desc') {
      items.sort((a, b) => (b.vacancyCount || 0) - (a.vacancyCount || 0));
    } else {
      // default: deadline_asc (soonest deadline first, ignoring closed ones)
      items.sort((a, b) => {
        if (!a.applicationDeadline) return 1;
        if (!b.applicationDeadline) return -1;
        return new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime();
      });
    }

    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const data = items.slice(startIndex, startIndex + limit);

    return {
      total,
      page,
      limit,
      totalPages,
      data,
    };
  }

  static getById(id: string, userProfile?: UserProfile | null) {
    const state = dbStore.getState();
    const item = state.opportunities.find(o => o.id === id);
    if (!item) return null;

    const dl = calculateDeadlineInfo(item.applicationDeadline, item.applicationStartDate);
    const potentialMatch = evaluateEligibility(userProfile, item);

    return {
      ...item,
      status: dl.status,
      deadlineStatus: dl.status,
      daysRemaining: dl.daysRemaining,
      potentialMatch,
    };
  }

  static getVersions(opportunityId: string) {
    const state = dbStore.getState();
    return state.opportunityVersions.filter(v => v.opportunityId === opportunityId);
  }

  static getRecommendations(userProfile: UserProfile, limit: number = 10) {
    const state = dbStore.getState();
    const scored = state.opportunities.map(opp => {
      const match = evaluateEligibility(userProfile, opp);
      const dl = calculateDeadlineInfo(opp.applicationDeadline, opp.applicationStartDate);
      return {
        ...opp,
        status: dl.status,
        deadlineStatus: dl.status,
        daysRemaining: dl.daysRemaining,
        potentialMatch: match,
      };
    });

    // Filter for open or upcoming opportunities
    const active = scored.filter(o => o.status !== 'CLOSED');

    // Sort by match score descending, then nearest deadline
    active.sort((a, b) => {
      const scoreDiff = (b.potentialMatch?.matchScore || 0) - (a.potentialMatch?.matchScore || 0);
      if (scoreDiff !== 0) return scoreDiff;
      return (a.daysRemaining || 999) - (b.daysRemaining || 999);
    });

    return active.slice(0, limit);
  }
}

import { dbStore } from '../db';
import { Opportunity, OpportunityVersion, SourceChange } from '@govalert/types';
import { NotificationsService } from './notifications';
import { formatDateIndian } from '@govalert/shared';

export interface ChangeDetectionResult {
  hasChanged: boolean;
  changes: { field: string; oldValue: any; newValue: any; description: string }[];
}

export class ChangeDetectorService {
  /**
   * Compares an existing opportunity against a newly ingested version.
   * Detects critical changes: deadline, exam date, vacancy count, status, eligibility.
   */
  static detectChanges(current: Opportunity, incoming: Partial<Opportunity>): ChangeDetectionResult {
    const changes: { field: string; oldValue: any; newValue: any; description: string }[] = [];

    // 1. Application Deadline change
    if (incoming.applicationDeadline && incoming.applicationDeadline !== current.applicationDeadline) {
      changes.push({
        field: 'applicationDeadline',
        oldValue: current.applicationDeadline,
        newValue: incoming.applicationDeadline,
        description: `Application deadline changed from ${formatDateIndian(current.applicationDeadline)} to ${formatDateIndian(incoming.applicationDeadline)}.`,
      });
    }

    // 2. Exam Date change
    if (incoming.examDate && incoming.examDate !== current.examDate) {
      changes.push({
        field: 'examDate',
        oldValue: current.examDate,
        newValue: incoming.examDate,
        description: `Examination date rescheduled from ${formatDateIndian(current.examDate)} to ${formatDateIndian(incoming.examDate)}.`,
      });
    }

    // 3. Vacancy count change
    if (incoming.vacancyCount != null && incoming.vacancyCount !== current.vacancyCount) {
      changes.push({
        field: 'vacancyCount',
        oldValue: current.vacancyCount,
        newValue: incoming.vacancyCount,
        description: `Vacancy count updated from ${current.vacancyCount || 0} to ${incoming.vacancyCount}.`,
      });
    }

    // 4. Status change
    if (incoming.status && incoming.status !== current.status) {
      changes.push({
        field: 'status',
        oldValue: current.status,
        newValue: incoming.status,
        description: `Status updated to ${incoming.status}.`,
      });
    }

    return {
      hasChanged: changes.length > 0,
      changes,
    };
  }

  /**
   * Applies detected changes, creates a historical snapshot version,
   * logs source_changes, and triggers notifications to tracked and saved users.
   */
  static applyChangesAndNotify(opportunityId: string, incoming: Partial<Opportunity>): { updated: boolean; versionNumber: number } {
    const state = dbStore.getState();
    const current = state.opportunities.find(o => o.id === opportunityId);
    if (!current) throw new Error('Opportunity not found.');

    const detection = this.detectChanges(current, incoming);
    if (!detection.hasChanged) {
      return { updated: false, versionNumber: current.version };
    }

    // Create version snapshot before updating
    const versionNumber = current.version + 1;
    const versionRecord: OpportunityVersion = {
      id: `ver-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      opportunityId: current.id,
      versionNumber: current.version,
      snapshotData: JSON.parse(JSON.stringify(current)),
      changesSummary: detection.changes.map(c => c.description).join(' | '),
      createdAt: new Date().toISOString(),
    };

    state.opportunityVersions.push(versionRecord);

    // Record source_changes
    const now = new Date().toISOString();
    for (const change of detection.changes) {
      const sourceChange: SourceChange = {
        id: `chg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        opportunityId: current.id,
        opportunityTitle: current.title,
        fieldName: change.field,
        oldValue: String(change.oldValue ?? ''),
        newValue: String(change.newValue ?? ''),
        detectedAt: now,
        isNotified: false,
      };
      state.sourceChanges.push(sourceChange);
    }

    // Update opportunity fields
    Object.assign(current, incoming);
    current.version = versionNumber;
    current.updatedAt = now;
    current.lastVerifiedAt = now;

    // Notify interested users (those who bookmarked or tracked this opportunity)
    const interestedUserIds = new Set<string>();
    state.savedOpportunities.filter(s => s.opportunityId === current.id).forEach(s => interestedUserIds.add(s.userId));
    state.trackedOpportunities.filter(t => t.opportunityId === current.id).forEach(t => interestedUserIds.add(t.userId));

    for (const userId of interestedUserIds) {
      for (const change of detection.changes) {
        NotificationsService.dispatch(
          userId,
          current.id,
          `IMPORTANT UPDATE: ${current.organization}`,
          `${current.title}\n${change.description}`,
          change.field === 'applicationDeadline' ? 'DEADLINE_CHANGE' : 'IMPORTANT_UPDATE',
          { opportunityId: current.id, field: change.field, oldValue: change.oldValue, newValue: change.newValue }
        );
      }
    }

    dbStore.save();
    return { updated: true, versionNumber };
  }
}

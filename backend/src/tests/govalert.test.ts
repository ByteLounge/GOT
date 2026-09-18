import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../services/auth';
import { OpportunityService } from '../services/opportunities';
import { BookmarksService } from '../services/bookmarks';
import { TrackerService } from '../services/tracker';
import { RemindersService } from '../services/reminders';
import { NotificationsService } from '../services/notifications';
import { ChangeDetectorService } from '../services/change-detector';
import { calculateDeadlineInfo, evaluateEligibility, calculateUserAge } from '@govalert/shared';
import { dbStore } from '../db';
import { Opportunity } from '@govalert/types';

describe('GovAlert Core System Test Suite', () => {
  let testUserId: string;

  beforeEach(async () => {
    // Register a test user for testing
    const email = `testuser_${Date.now()}@example.com`;
    const reg = await AuthService.register(email, 'Password123!', 'Pooja Patil');
    testUserId = reg.user.id;
  });

  describe('1. Authentication & Session Management', () => {
    it('registers user and creates profile with default notification preferences', async () => {
      const email = `pooja_${Date.now()}@test.com`;
      const result = await AuthService.register(email, 'SecretPass123', 'Pooja Patil');

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(result.profile.name).toBe('Pooja Patil');

      const me = AuthService.getMe(result.user.id);
      expect(me.user.email).toBe(email);
      expect(me.notificationPreferences?.dailyMax).toBe(5);
    });

    it('rejects duplicate email registrations', async () => {
      const email = `dup_${Date.now()}@test.com`;
      await AuthService.register(email, 'SecretPass123', 'First');

      await expect(
        AuthService.register(email, 'SecretPass123', 'Second')
      ).rejects.toThrow(/already exists/i);
    });

    it('authenticates valid credentials and rejects incorrect passwords', async () => {
      const email = `login_${Date.now()}@test.com`;
      await AuthService.register(email, 'CorrectPass123', 'Login Tester');

      const loggedIn = await AuthService.login(email, 'CorrectPass123');
      expect(loggedIn.token).toBeDefined();

      await expect(
        AuthService.login(email, 'WrongPass456')
      ).rejects.toThrow(/Invalid email or password/i);
    });
  });

  describe('2. Opportunity Discovery & Personalization Engine', () => {
    it('lists seeded opportunities with pagination and filtering', () => {
      const all = OpportunityService.list({ limit: 10 });
      expect(all.total).toBeGreaterThanOrEqual(30);
      expect(all.data.length).toBe(10);

      const jobs = OpportunityService.list({ category: 'Government Jobs' });
      expect(jobs.data.every(o => o.category === 'Government Jobs')).toBe(true);
    });

    it('filters opportunities by education level', () => {
      const diplomaOpps = OpportunityService.list({ education: 'Diploma' });
      expect(diplomaOpps.data.length).toBeGreaterThan(0);
      expect(diplomaOpps.data.some(o => o.organization.includes('DRDO') || o.organization.includes('SSC'))).toBe(true);
    });

    it('accurately evaluates deterministic eligibility rules', () => {
      const profile = {
        educationLevel: 'Undergraduate / Bachelor Degree',
        degree: 'B.Tech',
        branch: 'Computer Science & Engineering',
        dateOfBirth: '2002-05-15',
        state: 'Karnataka',
      };

      const opportunity: Partial<Opportunity> = {
        title: "Scientist 'SC'",
        educationRequirements: ['B.Tech', 'Undergraduate / Bachelor Degree'],
        branchRequirements: ['Computer Science', 'IT'],
        ageLimit: { min: 18, max: 28 },
      };

      const match = evaluateEligibility(profile as any, opportunity as any);
      expect(match.isPotentiallyEligible).toBe(true);
      expect(match.matchScore).toBe(100);
      expect(match.matchedCriteria.length).toBeGreaterThanOrEqual(3);
    });

    it('detects when user does not satisfy branch requirements', () => {
      const profile = {
        educationLevel: 'Undergraduate / Bachelor Degree',
        degree: 'B.Tech',
        branch: 'Civil Engineering',
        dateOfBirth: '2002-05-15',
      };

      const opportunity: Partial<Opportunity> = {
        title: "Scientist 'SC' (Electronics)",
        educationRequirements: ['B.Tech'],
        branchRequirements: ['Electronics', 'Telecommunication'],
        ageLimit: { min: 18, max: 28 },
      };

      const match = evaluateEligibility(profile as any, opportunity as any);
      expect(match.isPotentiallyEligible).toBe(false);
      expect(match.unmatchedCriteria.length).toBeGreaterThan(0);
    });
  });

  describe('3. Deadline Calculations & States', () => {
    it('calculates deadline states accurately (OPEN, CLOSING_SOON, CLOSING_TODAY, CLOSED)', () => {
      const ref = new Date('2026-09-18T10:00:00Z');

      const today = calculateDeadlineInfo('2026-09-18T18:00:00Z', null, ref);
      expect(today.status).toBe('CLOSING_TODAY');

      const tomorrow = calculateDeadlineInfo('2026-09-20T00:00:00Z', null, ref);
      expect(tomorrow.status).toBe('CLOSING_TOMORROW');

      const closingSoon = calculateDeadlineInfo('2026-09-24T00:00:00Z', null, ref);
      expect(closingSoon.status).toBe('CLOSING_SOON');

      const closed = calculateDeadlineInfo('2026-09-10T00:00:00Z', null, ref);
      expect(closed.status).toBe('CLOSED');
      expect(closed.daysRemaining).toBe(0);
    });
  });

  describe('4. Bookmarks & Application Tracker', () => {
    it('allows saving and removing opportunities', () => {
      const state = dbStore.getState();
      const opp = state.opportunities[0];

      const saved = BookmarksService.save(testUserId, opp.id);
      expect(saved.opportunityId).toBe(opp.id);

      const list = BookmarksService.list(testUserId);
      expect(list.some(s => s.opportunityId === opp.id)).toBe(true);

      const removed = BookmarksService.remove(testUserId, opp.id);
      expect(removed).toBe(true);

      const listAfter = BookmarksService.list(testUserId);
      expect(listAfter.some(s => s.opportunityId === opp.id)).toBe(false);
    });

    it('tracks application statuses with notes', () => {
      const state = dbStore.getState();
      const opp = state.opportunities[0];

      const tracked = TrackerService.track(testUserId, opp.id, 'Applied', 'Applied via online portal');
      expect(tracked.status).toBe('Applied');
      expect(tracked.notes).toBe('Applied via online portal');

      const updated = TrackerService.update(testUserId, tracked.id, 'Exam Scheduled', 'Admit card released for Oct 12');
      expect(updated.status).toBe('Exam Scheduled');
      expect(updated.notes).toContain('Admit card');
    });
  });

  describe('5. Change Detection & Versioning Engine', () => {
    it('detects changes in application deadline, creates version snapshot and logs source change', () => {
      const state = dbStore.getState();
      const opp = state.opportunities[0];
      const initialVersion = opp.version;

      // Save the opportunity for the test user so they receive change notifications
      BookmarksService.save(testUserId, opp.id);

      const newDeadline = '2026-11-20T23:59:59Z';
      const result = ChangeDetectorService.applyChangesAndNotify(opp.id, {
        applicationDeadline: newDeadline,
      });

      expect(result.updated).toBe(true);
      expect(result.versionNumber).toBe(initialVersion + 1);

      // Verify versions recorded
      const versions = OpportunityService.getVersions(opp.id);
      expect(versions.length).toBeGreaterThan(0);
      expect(versions[versions.length - 1].changesSummary).toContain('deadline changed');

      // Verify notification sent to tracked user
      const notifs = NotificationsService.list(testUserId);
      expect(notifs.some(n => n.category === 'DEADLINE_CHANGE')).toBe(true);
    });
  });

  describe('6. Anti-Spam Notification Policy', () => {
    it('suppresses duplicate notifications within 24 hours', () => {
      const oppId = 'test-opp-anti-spam';
      const first = NotificationsService.dispatch(
        testUserId,
        oppId,
        'Deadline Approaching',
        'Your application deadline is in 3 days.',
        'DEADLINE_ALERT'
      );
      expect(first.sent).toBe(true);

      const second = NotificationsService.dispatch(
        testUserId,
        oppId,
        'Deadline Approaching',
        'Your application deadline is in 3 days.',
        'DEADLINE_ALERT'
      );
      expect(second.sent).toBe(false);
      expect(second.reason).toContain('Duplicate notification suppressed');
    });

    it('enforces maximum daily notification limit', () => {
      NotificationsService.updatePreferences(testUserId, { dailyMax: 2 });

      // First two should send (using distinct categories or opp IDs)
      const res1 = NotificationsService.dispatch(testUserId, 'opp-1', 'Alert 1', 'Msg 1', 'NEW_OPPORTUNITY');
      const res2 = NotificationsService.dispatch(testUserId, 'opp-2', 'Alert 2', 'Msg 2', 'NEW_OPPORTUNITY');

      // Third should be capped
      const res3 = NotificationsService.dispatch(testUserId, 'opp-3', 'Alert 3', 'Msg 3', 'NEW_OPPORTUNITY');
      expect(res3.sent).toBe(false);
      expect(res3.reason).toContain('Daily limit');
    });
  });
});

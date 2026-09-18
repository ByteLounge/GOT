import cron from 'node-cron';
import { IngestionRunner } from '../ingestion/runner';
import { dbStore } from '../db';
import { RemindersService } from '../services/reminders';
import { NotificationsService } from '../services/notifications';

export class BackgroundWorkerScheduler {
  static init() {
    const cronSchedule = process.env.INGESTION_CRON_SCHEDULE || '0 */6 * * *';
    const isCronEnabled = process.env.ENABLE_INGESTION_CRON !== 'false';

    if (isCronEnabled) {
      console.log(`[Scheduler] Initializing automated source ingestion cron with schedule: "${cronSchedule}"`);
      cron.schedule(cronSchedule, async () => {
        console.log('[Scheduler] Running scheduled source monitoring passes...');
        try {
          const runs = await IngestionRunner.runAllActiveSources();
          console.log(`[Scheduler] Completed ${runs.length} source runs.`);
        } catch (err) {
          console.error('[Scheduler] Error during automated source pass:', err);
        }
      });
    }

    // Daily deadline reminder checker (runs every hour to evaluate upcoming reminders)
    cron.schedule('0 * * * *', async () => {
      console.log('[Scheduler] Checking scheduled opportunity reminders...');
      const state = dbStore.getState();
      const now = new Date().getTime();

      for (const reminder of state.reminders) {
        if (reminder.isSent) continue;
        const remTime = new Date(reminder.reminderDate).getTime();
        if (now >= remTime) {
          const opp = state.opportunities.find(o => o.id === reminder.opportunityId);
          if (opp) {
            const title = reminder.daysBefore === 0
              ? `DEADLINE TODAY: ${opp.title}`
              : `DEADLINE IN ${reminder.daysBefore} DAYS: ${opp.title}`;
            const message = `Application deadline for ${opp.organization} is on ${new Date(opp.applicationDeadline!).toLocaleDateString('en-IN')}. Verify official notice and submit now.`;

            NotificationsService.dispatch(
              reminder.userId,
              opp.id,
              title,
              message,
              reminder.daysBefore === 1 ? 'DEADLINE_TOMORROW' : 'DEADLINE_ALERT'
            );
            reminder.isSent = true;
          }
        }
      }
      dbStore.save();
    });
  }
}

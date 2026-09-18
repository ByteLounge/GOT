import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

export class MobileCalendarService {
  private static async getPrimaryCalendarId(): Promise<string | null> {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    if (Platform.OS === 'android') {
      const defaultCalendar = calendars.find(
        cal => cal.isPrimary || cal.accessLevel === Calendar.CalendarAccessLevel.OWNER
      );
      return defaultCalendar ? defaultCalendar.id : (calendars[0]?.id || null);
    } else {
      const defaultCalendar = await Calendar.getDefaultCalendarAsync();
      return defaultCalendar.id;
    }
  }

  static async addOpportunityEventToCalendar(
    title: string,
    organization: string,
    dateStr: string,
    eventType: 'Application Deadline' | 'Examination Date' | 'Interview',
    url?: string | null
  ): Promise<{ success: boolean; eventId?: string; error?: string }> {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        return { success: false, error: 'Calendar permission was denied.' };
      }

      const calendarId = await this.getPrimaryCalendarId();
      if (!calendarId) {
        return { success: false, error: 'No writable calendar found on device.' };
      }

      const startDate = new Date(dateStr);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

      const eventId = await Calendar.createEventAsync(calendarId, {
        title: `[GovAlert] ${eventType}: ${title}`,
        notes: `Organization: ${organization}\nOfficial Link: ${url || 'Check GovAlert App'}\n\nAdded via GovAlert App.`,
        startDate,
        endDate,
        allDay: false,
        alarms: [
          { relativeOffset: -24 * 60 }, // 1 day before
          { relativeOffset: -60 },      // 1 hour before
        ],
      });

      return { success: true, eventId };
    } catch (err: any) {
      console.error('Calendar error:', err);
      return { success: false, error: err.message || 'Failed to add event to calendar.' };
    }
  }
}

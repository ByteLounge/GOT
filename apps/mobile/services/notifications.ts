import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class LocalNotificationService {
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('govalert-deadlines', {
        name: 'GovAlert Deadlines & Updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  }

  static async scheduleOpportunityReminder(
    opportunityId: string,
    title: string,
    organization: string,
    reminderDate: Date,
    daysBefore: number
  ): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const triggerSeconds = Math.max(1, Math.floor((reminderDate.getTime() - Date.now()) / 1000));

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: daysBefore === 0
            ? `⚠️ Application Closes Today!`
            : `⏳ Deadline in ${daysBefore} Days: ${organization}`,
          body: `${title} application deadline is approaching. Verify your documents on official portal.`,
          data: { opportunityId },
          sound: 'default',
        },
        trigger: {
          seconds: triggerSeconds,
          channelId: 'govalert-deadlines',
        },
      });

      return id;
    } catch (err) {
      console.error('Failed to schedule local notification:', err);
      return null;
    }
  }

  static async showInstantAlert(title: string, body: string, data?: any) {
    await this.requestPermissions();
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: null, // instant
    });
  }
}

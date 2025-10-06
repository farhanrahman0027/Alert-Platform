import { Alert, UserAlertPreference } from '../../domain/models';
import {
  IUserNotificationService,
  IAlertRepository,
  IUserAlertPreferenceRepository,
  IAlertVisibilityRepository,
  IUserRepository
} from '../../domain/interfaces';

export class UserNotificationService implements IUserNotificationService {
  constructor(
    private alertRepository: IAlertRepository,
    private preferenceRepository: IUserAlertPreferenceRepository,
    private visibilityRepository: IAlertVisibilityRepository,
    private userRepository: IUserRepository
  ) {}

  getUserAlerts(userId: string): Alert[] {
    const user = this.userRepository.findById(userId);
    if (!user) return [];

    const activeAlerts = this.alertRepository.findActiveAlerts();

    return activeAlerts.filter(alert => {
      if (alert.visibilityType === 'organization') return true;

      if (alert.visibilityType === 'team') {
        const visibilities = this.visibilityRepository.findByAlert(alert.id);
        return visibilities.some(v => v.teamId === user.teamId);
      }

      if (alert.visibilityType === 'user') {
        const visibilities = this.visibilityRepository.findByAlert(alert.id);
        return visibilities.some(v => v.userId === userId);
      }

      return false;
    });
  }

  markAsRead(userId: string, alertId: string): void {
    const preference = this.preferenceRepository.findByUserAndAlert(userId, alertId);
    if (preference) {
      this.preferenceRepository.update(preference.id, {
        isRead: true,
        updatedAt: new Date()
      });
    }
  }

  snoozeAlert(userId: string, alertId: string): void {
    const preference = this.preferenceRepository.findByUserAndAlert(userId, alertId);
    if (preference) {
      const tomorrow = new Date();
      tomorrow.setHours(23, 59, 59, 999);

      this.preferenceRepository.update(preference.id, {
        snoozedUntil: tomorrow,
        updatedAt: new Date()
      });
    }
  }

  getUserPreferences(userId: string): UserAlertPreference[] {
    return this.preferenceRepository.findByUser(userId);
  }
}

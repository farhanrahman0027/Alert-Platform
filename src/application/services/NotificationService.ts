import { v4 as uuidv4 } from 'uuid';
import { Alert, User } from '../../domain/models';
import {
  INotificationService,
  INotificationDeliveryRepository,
  IUserAlertPreferenceRepository,
  IAlertRepository,
  IUserRepository
} from '../../domain/interfaces';
import { NotificationChannelFactory } from '../../infrastructure/channels/NotificationChannelFactory';

export class NotificationService implements INotificationService {
  constructor(
    private channelFactory: NotificationChannelFactory,
    private deliveryRepository: INotificationDeliveryRepository,
    private preferenceRepository: IUserAlertPreferenceRepository,
    private alertRepository: IAlertRepository,
    private userRepository: IUserRepository
  ) {}

  async deliverAlert(alert: Alert, users: User[]): Promise<void> {
    const channel = this.channelFactory.getChannel(alert.deliveryType);

    for (const user of users) {
      await channel.deliver(alert, user);

      this.deliveryRepository.create({
        id: uuidv4(),
        alertId: alert.id,
        userId: user.id,
        deliveryType: alert.deliveryType,
        deliveredAt: new Date(),
        isReminder: false,
        createdAt: new Date()
      });

      let preference = this.preferenceRepository.findByUserAndAlert(user.id, alert.id);
      if (!preference) {
        preference = this.preferenceRepository.create({
          id: uuidv4(),
          alertId: alert.id,
          userId: user.id,
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
  }

  async checkAndSendReminders(): Promise<void> {
    const activeAlerts = this.alertRepository.findActiveAlerts();
    const now = new Date();

    for (const alert of activeAlerts) {
      if (!alert.reminderEnabled) continue;

      const preferences = this.preferenceRepository.findByAlert(alert.id);

      for (const pref of preferences) {
        if (pref.isRead) continue;

        if (pref.snoozedUntil && pref.snoozedUntil > now) continue;

        const shouldRemind = !pref.lastRemindedAt ||
          (now.getTime() - pref.lastRemindedAt.getTime()) >= alert.reminderFrequencyMinutes * 60 * 1000;

        if (shouldRemind) {
          const user = this.userRepository.findById(pref.userId);
          if (!user) continue;

          const channel = this.channelFactory.getChannel(alert.deliveryType);
          await channel.deliver(alert, user);

          this.deliveryRepository.create({
            id: uuidv4(),
            alertId: alert.id,
            userId: user.id,
            deliveryType: alert.deliveryType,
            deliveredAt: now,
            isReminder: true,
            createdAt: now
          });

          this.preferenceRepository.update(pref.id, {
            lastRemindedAt: now,
            updatedAt: now
          });
        }
      }
    }
  }
}

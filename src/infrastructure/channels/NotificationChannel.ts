import { INotificationChannel } from '../../domain/interfaces';
import { Alert, User } from '../../domain/models';

export abstract class NotificationChannel implements INotificationChannel {
  abstract deliver(alert: Alert, user: User): Promise<void>;
  abstract getType(): string;

  protected formatMessage(alert: Alert, user: User): string {
    return `[${alert.severity.toUpperCase()}] ${alert.title}\n\n${alert.message}\n\nTo: ${user.fullName} (${user.email})`;
  }
}

export class InAppNotificationChannel extends NotificationChannel {
  private notifications: Array<{ alert: Alert; user: User; timestamp: Date }> = [];

  async deliver(alert: Alert, user: User): Promise<void> {
    this.notifications.push({
      alert,
      user,
      timestamp: new Date()
    });
    console.log(`[IN-APP] Delivered to ${user.email}: ${alert.title}`);
  }

  getType(): string {
    return 'in_app';
  }

  getNotifications(): Array<{ alert: Alert; user: User; timestamp: Date }> {
    return this.notifications;
  }
}

export class EmailNotificationChannel extends NotificationChannel {
  async deliver(alert: Alert, user: User): Promise<void> {
    console.log(`[EMAIL] Would send to ${user.email}: ${this.formatMessage(alert, user)}`);
  }

  getType(): string {
    return 'email';
  }
}

export class SMSNotificationChannel extends NotificationChannel {
  async deliver(alert: Alert, user: User): Promise<void> {
    console.log(`[SMS] Would send to ${user.email}: ${alert.title}`);
  }

  getType(): string {
    return 'sms';
  }
}

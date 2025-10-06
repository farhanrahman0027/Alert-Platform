import { INotificationChannel } from '../../domain/interfaces';
import { DeliveryType } from '../../domain/models';
import {
  InAppNotificationChannel,
  EmailNotificationChannel,
  SMSNotificationChannel
} from './NotificationChannel';

export class NotificationChannelFactory {
  private channels: Map<string, INotificationChannel> = new Map();

  constructor() {
    this.registerChannel(new InAppNotificationChannel());
    this.registerChannel(new EmailNotificationChannel());
    this.registerChannel(new SMSNotificationChannel());
  }

  registerChannel(channel: INotificationChannel): void {
    this.channels.set(channel.getType(), channel);
  }

  getChannel(type: DeliveryType): INotificationChannel {
    const channel = this.channels.get(type);
    if (!channel) {
      throw new Error(`No notification channel registered for type: ${type}`);
    }
    return channel;
  }

  getAllChannels(): INotificationChannel[] {
    return Array.from(this.channels.values());
  }
}

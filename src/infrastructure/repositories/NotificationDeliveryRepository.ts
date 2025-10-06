import { NotificationDelivery } from '../../domain/models';
import { INotificationDeliveryRepository } from '../../domain/interfaces';
import { InMemoryRepository } from './InMemoryRepository';

export class NotificationDeliveryRepository extends InMemoryRepository<NotificationDelivery> implements INotificationDeliveryRepository {
  findByUser(userId: string): NotificationDelivery[] {
    return this.filter(nd => nd.userId === userId);
  }

  findByAlert(alertId: string): NotificationDelivery[] {
    return this.filter(nd => nd.alertId === alertId);
  }
}

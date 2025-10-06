import { Alert } from '../../domain/models';
import { IAlertRepository } from '../../domain/interfaces';
import { InMemoryRepository } from './InMemoryRepository';

export class AlertRepository extends InMemoryRepository<Alert> implements IAlertRepository {
  findByStatus(status: string): Alert[] {
    return this.filter(alert => alert.status === status);
  }

  findByCreator(userId: string): Alert[] {
    return this.filter(alert => alert.createdBy === userId);
  }

  findActiveAlerts(): Alert[] {
    const now = new Date();
    return this.filter(alert =>
      alert.status === 'active' &&
      alert.startTime <= now &&
      (!alert.expiryTime || alert.expiryTime > now)
    );
  }
}

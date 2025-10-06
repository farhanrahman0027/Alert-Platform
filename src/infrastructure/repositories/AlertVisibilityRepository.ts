import { AlertVisibility } from '../../domain/models';
import { IAlertVisibilityRepository } from '../../domain/interfaces';
import { InMemoryRepository } from './InMemoryRepository';

export class AlertVisibilityRepository extends InMemoryRepository<AlertVisibility> implements IAlertVisibilityRepository {
  findByAlert(alertId: string): AlertVisibility[] {
    return this.filter(av => av.alertId === alertId);
  }

  deleteByAlert(alertId: string): void {
    const toDelete = this.findByAlert(alertId);
    toDelete.forEach(av => this.delete(av.id));
  }
}

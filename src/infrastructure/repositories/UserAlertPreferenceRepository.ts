import { UserAlertPreference } from '../../domain/models';
import { IUserAlertPreferenceRepository } from '../../domain/interfaces';
import { InMemoryRepository } from './InMemoryRepository';

export class UserAlertPreferenceRepository extends InMemoryRepository<UserAlertPreference> implements IUserAlertPreferenceRepository {
  findByUser(userId: string): UserAlertPreference[] {
    return this.filter(pref => pref.userId === userId);
  }

  findByAlert(alertId: string): UserAlertPreference[] {
    return this.filter(pref => pref.alertId === alertId);
  }

  findByUserAndAlert(userId: string, alertId: string): UserAlertPreference | undefined {
    return this.filter(pref => pref.userId === userId && pref.alertId === alertId)[0];
  }
}

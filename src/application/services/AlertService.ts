import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertWithTargets } from '../../domain/models';
import { IAlertService, IAlertRepository, IAlertVisibilityRepository } from '../../domain/interfaces';

export class AlertService implements IAlertService {
  constructor(
    private alertRepository: IAlertRepository,
    private visibilityRepository: IAlertVisibilityRepository
  ) {}

  createAlert(
    alertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>,
    targetTeamIds: string[] = [],
    targetUserIds: string[] = []
  ): AlertWithTargets {
    const now = new Date();
    const alert: Alert = {
      ...alertData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };

    this.alertRepository.create(alert);

    if (alertData.visibilityType === 'team') {
      targetTeamIds.forEach(teamId => {
        this.visibilityRepository.create({
          id: uuidv4(),
          alertId: alert.id,
          teamId,
          createdAt: now
        });
      });
    } else if (alertData.visibilityType === 'user') {
      targetUserIds.forEach(userId => {
        this.visibilityRepository.create({
          id: uuidv4(),
          alertId: alert.id,
          userId,
          createdAt: now
        });
      });
    }

    return {
      ...alert,
      targetTeamIds,
      targetUserIds
    };
  }

  updateAlert(id: string, updates: Partial<Alert>): Alert | undefined {
    const updated = this.alertRepository.update(id, {
      ...updates,
      updatedAt: new Date()
    });
    return updated;
  }

  archiveAlert(id: string): Alert | undefined {
    return this.updateAlert(id, { status: 'archived' });
  }

  getAlert(id: string): AlertWithTargets | undefined {
    const alert = this.alertRepository.findById(id);
    if (!alert) return undefined;

    const visibilities = this.visibilityRepository.findByAlert(id);
    return {
      ...alert,
      targetTeamIds: visibilities.filter(v => v.teamId).map(v => v.teamId!),
      targetUserIds: visibilities.filter(v => v.userId).map(v => v.userId!)
    };
  }

  getAllAlerts(): AlertWithTargets[] {
    return this.alertRepository.findAll().map(alert => {
      const visibilities = this.visibilityRepository.findByAlert(alert.id);
      return {
        ...alert,
        targetTeamIds: visibilities.filter(v => v.teamId).map(v => v.teamId!),
        targetUserIds: visibilities.filter(v => v.userId).map(v => v.userId!)
      };
    });
  }

  getActiveAlerts(): AlertWithTargets[] {
    return this.alertRepository.findActiveAlerts().map(alert => {
      const visibilities = this.visibilityRepository.findByAlert(alert.id);
      return {
        ...alert,
        targetTeamIds: visibilities.filter(v => v.teamId).map(v => v.teamId!),
        targetUserIds: visibilities.filter(v => v.userId).map(v => v.userId!)
      };
    });
  }
}

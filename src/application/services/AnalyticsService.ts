import {
  IAnalyticsService,
  IAlertRepository,
  INotificationDeliveryRepository,
  IUserAlertPreferenceRepository
} from '../../domain/interfaces';

export class AnalyticsService implements IAnalyticsService {
  constructor(
    private alertRepository: IAlertRepository,
    private deliveryRepository: INotificationDeliveryRepository,
    private preferenceRepository: IUserAlertPreferenceRepository
  ) {}

  getTotalAlerts(): number {
    return this.alertRepository.findAll().length;
  }

  getAlertsDelivered(): number {
    return this.deliveryRepository.findAll().length;
  }

  getAlertsRead(): number {
    return this.preferenceRepository.findAll().filter(p => p.isRead).length;
  }

  getSnoozedCounts(): Map<string, number> {
    const now = new Date();
    const snoozedPrefs = this.preferenceRepository
      .findAll()
      .filter(p => p.snoozedUntil && p.snoozedUntil > now);

    const counts = new Map<string, number>();
    snoozedPrefs.forEach(pref => {
      const count = counts.get(pref.alertId) || 0;
      counts.set(pref.alertId, count + 1);
    });

    return counts;
  }

  getSeverityBreakdown(): Map<string, number> {
    const alerts = this.alertRepository.findAll();
    const breakdown = new Map<string, number>();

    alerts.forEach(alert => {
      const count = breakdown.get(alert.severity) || 0;
      breakdown.set(alert.severity, count + 1);
    });

    return breakdown;
  }
}

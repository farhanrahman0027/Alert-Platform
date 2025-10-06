import { AlertRepository } from '../infrastructure/repositories/AlertRepository';
import { UserRepository } from '../infrastructure/repositories/UserRepository';
import { TeamRepository } from '../infrastructure/repositories/TeamRepository';
import { AlertVisibilityRepository } from '../infrastructure/repositories/AlertVisibilityRepository';
import { NotificationDeliveryRepository } from '../infrastructure/repositories/NotificationDeliveryRepository';
import { UserAlertPreferenceRepository } from '../infrastructure/repositories/UserAlertPreferenceRepository';
import { NotificationChannelFactory } from '../infrastructure/channels/NotificationChannelFactory';
import { AlertService } from './services/AlertService';
import { NotificationService } from './services/NotificationService';
import { UserNotificationService } from './services/UserNotificationService';
import { AnalyticsService } from './services/AnalyticsService';

export class AppContext {
  private static instance: AppContext;

  public readonly alertRepository: AlertRepository;
  public readonly userRepository: UserRepository;
  public readonly teamRepository: TeamRepository;
  public readonly visibilityRepository: AlertVisibilityRepository;
  public readonly deliveryRepository: NotificationDeliveryRepository;
  public readonly preferenceRepository: UserAlertPreferenceRepository;

  public readonly channelFactory: NotificationChannelFactory;

  public readonly alertService: AlertService;
  public readonly notificationService: NotificationService;
  public readonly userNotificationService: UserNotificationService;
  public readonly analyticsService: AnalyticsService;

  private reminderIntervalId?: number;

  private constructor() {
    this.alertRepository = new AlertRepository();
    this.userRepository = new UserRepository();
    this.teamRepository = new TeamRepository();
    this.visibilityRepository = new AlertVisibilityRepository();
    this.deliveryRepository = new NotificationDeliveryRepository();
    this.preferenceRepository = new UserAlertPreferenceRepository();

    this.channelFactory = new NotificationChannelFactory();

    this.alertService = new AlertService(
      this.alertRepository,
      this.visibilityRepository
    );

    this.notificationService = new NotificationService(
      this.channelFactory,
      this.deliveryRepository,
      this.preferenceRepository,
      this.alertRepository,
      this.userRepository
    );

    this.userNotificationService = new UserNotificationService(
      this.alertRepository,
      this.preferenceRepository,
      this.visibilityRepository,
      this.userRepository
    );

    this.analyticsService = new AnalyticsService(
      this.alertRepository,
      this.deliveryRepository,
      this.preferenceRepository
    );
  }

  static getInstance(): AppContext {
    if (!AppContext.instance) {
      AppContext.instance = new AppContext();
    }
    return AppContext.instance;
  }

  startReminderScheduler(intervalMinutes: number = 2): void {
    if (this.reminderIntervalId) {
      clearInterval(this.reminderIntervalId);
    }

    this.reminderIntervalId = window.setInterval(() => {
      this.notificationService.checkAndSendReminders();
    }, intervalMinutes * 60 * 1000);

    console.log(`Reminder scheduler started (every ${intervalMinutes} minutes)`);
  }

  stopReminderScheduler(): void {
    if (this.reminderIntervalId) {
      clearInterval(this.reminderIntervalId);
      this.reminderIntervalId = undefined;
      console.log('Reminder scheduler stopped');
    }
  }
}

import {
  Alert,
  AlertVisibility,
  AlertWithTargets,
  NotificationDelivery,
  Team,
  User,
  UserAlertPreference
} from './models';

export interface IRepository<T> {
  findById(id: string): T | undefined;
  findAll(): T[];
  create(entity: T): T;
  update(id: string, entity: Partial<T>): T | undefined;
  delete(id: string): boolean;
}

export interface IAlertRepository extends IRepository<Alert> {
  findByStatus(status: string): Alert[];
  findByCreator(userId: string): Alert[];
  findActiveAlerts(): Alert[];
}

export interface IUserRepository extends IRepository<User> {
  findByEmail(email: string): User | undefined;
  findByRole(role: string): User[];
  findByTeam(teamId: string): User[];
}

export interface IAlertVisibilityRepository extends IRepository<AlertVisibility> {
  findByAlert(alertId: string): AlertVisibility[];
  deleteByAlert(alertId: string): void;
}

export interface INotificationDeliveryRepository extends IRepository<NotificationDelivery> {
  findByUser(userId: string): NotificationDelivery[];
  findByAlert(alertId: string): NotificationDelivery[];
}

export interface IUserAlertPreferenceRepository extends IRepository<UserAlertPreference> {
  findByUser(userId: string): UserAlertPreference[];
  findByAlert(alertId: string): UserAlertPreference[];
  findByUserAndAlert(userId: string, alertId: string): UserAlertPreference | undefined;
}

export interface INotificationChannel {
  deliver(alert: Alert, user: User): Promise<void>;
  getType(): string;
}

export interface IAlertService {
  createAlert(alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>, targetTeamIds?: string[], targetUserIds?: string[]): AlertWithTargets;
  updateAlert(id: string, updates: Partial<Alert>): Alert | undefined;
  archiveAlert(id: string): Alert | undefined;
  getAlert(id: string): AlertWithTargets | undefined;
  getAllAlerts(): AlertWithTargets[];
  getActiveAlerts(): AlertWithTargets[];
}

export interface INotificationService {
  deliverAlert(alert: Alert, users: User[]): Promise<void>;
  checkAndSendReminders(): Promise<void>;
}

export interface IUserNotificationService {
  getUserAlerts(userId: string): Alert[];
  markAsRead(userId: string, alertId: string): void;
  snoozeAlert(userId: string, alertId: string): void;
  getUserPreferences(userId: string): UserAlertPreference[];
}

export interface IAnalyticsService {
  getTotalAlerts(): number;
  getAlertsDelivered(): number;
  getAlertsRead(): number;
  getSnoozedCounts(): Map<string, number>;
  getSeverityBreakdown(): Map<string, number>;
}

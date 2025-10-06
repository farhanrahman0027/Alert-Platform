export type Severity = 'info' | 'warning' | 'critical';
export type DeliveryType = 'in_app' | 'email' | 'sms';
export type VisibilityType = 'organization' | 'team' | 'user';
export type AlertStatus = 'active' | 'archived';
export type UserRole = 'admin' | 'user';

export interface Team {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  teamId?: string;
  createdAt: Date;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: Severity;
  deliveryType: DeliveryType;
  visibilityType: VisibilityType;
  reminderFrequencyMinutes: number;
  reminderEnabled: boolean;
  startTime: Date;
  expiryTime?: Date;
  status: AlertStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertVisibility {
  id: string;
  alertId: string;
  teamId?: string;
  userId?: string;
  createdAt: Date;
}

export interface NotificationDelivery {
  id: string;
  alertId: string;
  userId: string;
  deliveryType: DeliveryType;
  deliveredAt: Date;
  isReminder: boolean;
  createdAt: Date;
}

export interface UserAlertPreference {
  id: string;
  alertId: string;
  userId: string;
  isRead: boolean;
  snoozedUntil?: Date;
  lastRemindedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertWithTargets extends Alert {
  targetTeamIds: string[];
  targetUserIds: string[];
}

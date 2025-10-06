# Alerting & Notification Platform

A production-ready alerting and notification system built with clean OOP architecture, demonstrating best practices in software design patterns and modular architecture.

## Features

### Admin Capabilities
- Create unlimited alerts with customizable properties
- Configure alert severity (Info, Warning, Critical)
- Set visibility scope (Organization, Team, User)
- Manage reminder frequency and scheduling
- Archive and manage existing alerts
- Real-time analytics dashboard

### User Capabilities
- Receive relevant alerts based on visibility settings
- Mark alerts as read
- Snooze alerts for the day
- Automatic reminders every 2 hours
- Clean, intuitive notification interface

### System Features
- Automated reminder system with configurable intervals
- Snooze management with daily reset
- Analytics tracking and reporting
- Extensible notification channels (Strategy Pattern)
- Clean separation of concerns

## Architecture

### Design Patterns Used

#### 1. Strategy Pattern
The notification delivery system uses the Strategy pattern to allow different delivery channels (In-App, Email, SMS) without modifying existing code.

```typescript
// NotificationChannel.ts - Base strategy
export abstract class NotificationChannel implements INotificationChannel {
  abstract deliver(alert: Alert, user: User): Promise<void>;
  abstract getType(): string;
}

// Concrete implementations
export class InAppNotificationChannel extends NotificationChannel { ... }
export class EmailNotificationChannel extends NotificationChannel { ... }
export class SMSNotificationChannel extends NotificationChannel { ... }
```

#### 2. Repository Pattern
Data access is abstracted through repositories, making it easy to swap data sources:

```typescript
export abstract class InMemoryRepository<T> implements IRepository<T> {
  protected data: Map<string, T> = new Map();
  // CRUD operations...
}
```

#### 3. Singleton Pattern
The application context ensures a single source of truth:

```typescript
export class AppContext {
  private static instance: AppContext;
  static getInstance(): AppContext { ... }
}
```

#### 4. Service Layer Pattern
Business logic is encapsulated in dedicated services:
- `AlertService` - Alert CRUD operations
- `NotificationService` - Delivery and reminder logic
- `UserNotificationService` - User-facing operations
- `AnalyticsService` - Metrics and reporting

## Project Structure

```
src/
├── domain/
│   ├── models.ts              # Domain entities and types
│   └── interfaces.ts          # Service and repository interfaces
├── infrastructure/
│   ├── repositories/          # Data access implementations
│   │   ├── InMemoryRepository.ts
│   │   ├── AlertRepository.ts
│   │   ├── UserRepository.ts
│   │   └── ...
│   └── channels/              # Notification delivery channels
│       ├── NotificationChannel.ts
│       └── NotificationChannelFactory.ts
├── application/
│   ├── services/              # Business logic services
│   │   ├── AlertService.ts
│   │   ├── NotificationService.ts
│   │   ├── UserNotificationService.ts
│   │   └── AnalyticsService.ts
│   └── AppContext.ts          # Dependency injection container
├── components/                 # React UI components
│   ├── AdminDashboard.tsx
│   ├── UserDashboard.tsx
│   ├── CreateAlertModal.tsx
│   └── AnalyticsDashboard.tsx
├── data/
│   └── seedData.ts            # Initial test data
└── App.tsx                    # Main application
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Usage

### Admin View
1. Click "Admin" in the navigation bar
2. Create new alerts using the "Create Alert" button
3. Configure alert properties, severity, and visibility
4. View analytics and manage existing alerts
5. Archive alerts when no longer needed

### User View
1. Click "User" in the navigation bar
2. Select a user from the dropdown
3. View active notifications
4. Mark alerts as read or snooze for the day
5. Receive automatic reminders every 2 hours

## Key Technical Decisions

### 1. OOP Design Principles
- **Single Responsibility**: Each class has one clear purpose
- **Open/Closed**: Extensible through inheritance and interfaces
- **Liskov Substitution**: Implementations are interchangeable
- **Interface Segregation**: Focused, specific interfaces
- **Dependency Inversion**: Depends on abstractions, not concretions

### 2. Reminder System
The reminder system runs on a configurable interval (default 2 minutes for demo purposes):
- Checks active alerts
- Identifies users who haven't read/snoozed
- Respects snooze periods
- Tracks last reminder time per user/alert

### 3. Snooze Logic
- Snoozes until end of current day (11:59:59 PM)
- Automatically resets next day
- Doesn't affect other users
- Prevents reminders during snooze period

### 4. Visibility Management
- **Organization**: All users receive the alert
- **Team**: Only team members receive the alert
- **User**: Only specific users receive the alert

## Extensibility

### Adding a New Notification Channel

1. Create a new channel class:
```typescript
export class PushNotificationChannel extends NotificationChannel {
  async deliver(alert: Alert, user: User): Promise<void> {
    // Implementation
  }

  getType(): string {
    return 'push';
  }
}
```

2. Register it in the factory:
```typescript
constructor() {
  this.registerChannel(new PushNotificationChannel());
}
```

### Adding a New Repository
Extend `InMemoryRepository` or implement `IRepository`:
```typescript
export class CustomRepository extends InMemoryRepository<CustomEntity> {
  // Custom query methods
}
```

### Swapping Data Sources
Replace in-memory repositories with database-backed implementations:
```typescript
export class PostgresAlertRepository implements IAlertRepository {
  // Database operations using your preferred ORM
}
```

## Analytics Metrics

The system tracks:
- Total alerts created
- Total deliveries sent
- Read vs unread counts
- Snoozed alerts per user
- Severity distribution

## Future Enhancements

### Planned Features (Not in MVP)
- Email delivery integration
- SMS delivery integration
- Customizable reminder frequencies
- Scheduled alerts (cron-style)
- Escalation workflows
- Role-based access control
- Push notifications
- Alert templates
- User preferences dashboard
- Delivery status webhooks

## Testing

Seed data includes:
- 3 teams (Engineering, Marketing, Sales)
- 1 admin user
- 4 regular users
- 4 sample alerts with different configurations

Switch between Admin and User views to test all functionality.

## Technical Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Architecture**: Clean Architecture, OOP
- **Patterns**: Strategy, Repository, Singleton, Service Layer
- **Build Tool**: Vite

## License

MIT

## Author

Built as a demonstration of clean OOP architecture and design patterns in a real-world alerting system.

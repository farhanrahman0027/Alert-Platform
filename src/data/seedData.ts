import { v4 as uuidv4 } from 'uuid';
import { AppContext } from '../application/AppContext';

export function seedData() {
  const ctx = AppContext.getInstance();

  const engineeringTeam = ctx.teamRepository.create({
    id: uuidv4(),
    name: 'Engineering',
    description: 'Software development team',
    createdAt: new Date()
  });

  const marketingTeam = ctx.teamRepository.create({
    id: uuidv4(),
    name: 'Marketing',
    description: 'Marketing and communications team',
    createdAt: new Date()
  });

  const salesTeam = ctx.teamRepository.create({
    id: uuidv4(),
    name: 'Sales',
    description: 'Sales and business development team',
    createdAt: new Date()
  });

  const adminUser = ctx.userRepository.create({
    id: uuidv4(),
    email: 'admin@company.com',
    fullName: 'Admin User',
    role: 'admin',
    createdAt: new Date()
  });

  const user1 = ctx.userRepository.create({
    id: uuidv4(),
    email: 'john.doe@company.com',
    fullName: 'John Doe',
    role: 'user',
    teamId: engineeringTeam.id,
    createdAt: new Date()
  });

  const user2 = ctx.userRepository.create({
    id: uuidv4(),
    email: 'jane.smith@company.com',
    fullName: 'Jane Smith',
    role: 'user',
    teamId: engineeringTeam.id,
    createdAt: new Date()
  });

  const user3 = ctx.userRepository.create({
    id: uuidv4(),
    email: 'mike.johnson@company.com',
    fullName: 'Mike Johnson',
    role: 'user',
    teamId: marketingTeam.id,
    createdAt: new Date()
  });

  const user4 = ctx.userRepository.create({
    id: uuidv4(),
    email: 'sarah.williams@company.com',
    fullName: 'Sarah Williams',
    role: 'user',
    teamId: salesTeam.id,
    createdAt: new Date()
  });

  const alert1 = ctx.alertService.createAlert(
    {
      title: 'System Maintenance Scheduled',
      message: 'Our systems will undergo scheduled maintenance on Saturday, 2 AM - 6 AM. Please save your work and log out before this time.',
      severity: 'warning',
      deliveryType: 'in_app',
      visibilityType: 'organization',
      reminderFrequencyMinutes: 120,
      reminderEnabled: true,
      startTime: new Date(),
      status: 'active',
      createdBy: adminUser.id
    },
    [],
    []
  );

  const alert2 = ctx.alertService.createAlert(
    {
      title: 'Critical Security Update Required',
      message: 'A critical security vulnerability has been identified. All team members must update their credentials immediately. Visit the security portal for instructions.',
      severity: 'critical',
      deliveryType: 'in_app',
      visibilityType: 'team',
      reminderFrequencyMinutes: 120,
      reminderEnabled: true,
      startTime: new Date(),
      status: 'active',
      createdBy: adminUser.id
    },
    [engineeringTeam.id],
    []
  );

  const alert3 = ctx.alertService.createAlert(
    {
      title: 'New Product Launch Next Week',
      message: 'We are excited to announce the launch of our new product next Monday. Marketing materials and talking points are available in the shared drive.',
      severity: 'info',
      deliveryType: 'in_app',
      visibilityType: 'team',
      reminderFrequencyMinutes: 120,
      reminderEnabled: true,
      startTime: new Date(),
      status: 'active',
      createdBy: adminUser.id
    },
    [marketingTeam.id, salesTeam.id],
    []
  );

  const alert4 = ctx.alertService.createAlert(
    {
      title: 'Action Required: Complete Annual Training',
      message: 'Your annual compliance training is due by the end of this month. Please complete all required modules in the learning portal.',
      severity: 'warning',
      deliveryType: 'in_app',
      visibilityType: 'user',
      reminderFrequencyMinutes: 120,
      reminderEnabled: true,
      startTime: new Date(),
      status: 'active',
      createdBy: adminUser.id
    },
    [],
    [user1.id, user3.id]
  );

  const allUsers = [user1, user2, user3, user4];

  ctx.notificationService.deliverAlert(alert1, allUsers);
  ctx.notificationService.deliverAlert(alert2, [user1, user2]);
  ctx.notificationService.deliverAlert(alert3, [user3, user4]);
  ctx.notificationService.deliverAlert(alert4, [user1, user3]);

  ctx.startReminderScheduler(2);

  console.log('Seed data created successfully!');
  console.log(`Admin: ${adminUser.email}`);
  console.log(`Users: ${allUsers.map(u => u.email).join(', ')}`);
}

import { User } from '../../domain/models';
import { IUserRepository } from '../../domain/interfaces';
import { InMemoryRepository } from './InMemoryRepository';

export class UserRepository extends InMemoryRepository<User> implements IUserRepository {
  findByEmail(email: string): User | undefined {
    return this.filter(user => user.email === email)[0];
  }

  findByRole(role: string): User[] {
    return this.filter(user => user.role === role);
  }

  findByTeam(teamId: string): User[] {
    return this.filter(user => user.teamId === teamId);
  }
}

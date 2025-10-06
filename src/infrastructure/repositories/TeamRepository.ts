import { Team } from '../../domain/models';
import { InMemoryRepository } from './InMemoryRepository';

export class TeamRepository extends InMemoryRepository<Team> {}

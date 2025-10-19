import { Test, TestingModule } from '@nestjs/testing';
import { EventVolunteersService } from './event-volunteers.service';

describe('EventVolunteersService', () => {
  let service: EventVolunteersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventVolunteersService],
    }).compile();

    service = module.get<EventVolunteersService>(EventVolunteersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { EventResourcesService } from './event-resources.service';

describe('EventResourcesService', () => {
  let service: EventResourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventResourcesService],
    }).compile();

    service = module.get<EventResourcesService>(EventResourcesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

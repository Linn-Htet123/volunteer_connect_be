import { Test, TestingModule } from '@nestjs/testing';
import { EventResourcesController } from './event-resources.controller';
import { EventResourcesService } from './event-resources.service';

describe('EventResourcesController', () => {
  let controller: EventResourcesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventResourcesController],
      providers: [EventResourcesService],
    }).compile();

    controller = module.get<EventResourcesController>(EventResourcesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

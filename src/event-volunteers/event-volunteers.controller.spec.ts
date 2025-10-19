import { Test, TestingModule } from '@nestjs/testing';
import { EventVolunteersController } from './event-volunteers.controller';
import { EventVolunteersService } from './event-volunteers.service';

describe('EventVolunteersController', () => {
  let controller: EventVolunteersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventVolunteersController],
      providers: [EventVolunteersService],
    }).compile();

    controller = module.get<EventVolunteersController>(
      EventVolunteersController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

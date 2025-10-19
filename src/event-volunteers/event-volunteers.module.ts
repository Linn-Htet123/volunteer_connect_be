import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventVolunteersService } from './event-volunteers.service';
import { EventVolunteersController } from './event-volunteers.controller';
import { EventVolunteer } from './entities/event-volunteer.entity';
import { Event } from 'src/events/entities/event.entity';
import { Volunteer } from 'src/volunteers/entities/volunteer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventVolunteer, Event, Volunteer])],
  controllers: [EventVolunteersController],
  providers: [EventVolunteersService],
  exports: [EventVolunteersService],
})
export class EventVolunteersModule {}

// src/event-resources/event-resources.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventResourcesService } from './event-resources.service';
import { EventResourcesController } from './event-resources.controller';
import { EventResource } from './entities/event-resource.entity';
import { Event } from 'src/events/entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventResource, Event])],
  providers: [EventResourcesService],
  controllers: [EventResourcesController],
})
export class EventResourcesModule {}

import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { User } from 'src/users/entities/user.entity';
import { Event } from 'src/events/entities/event.entity';
import { VolunteerTask } from './entities/volunteer-task.entity';
import { Volunteer } from 'src/volunteers/entities/volunteer.entity';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, User, Event, VolunteerTask, Volunteer]),
    MailModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}

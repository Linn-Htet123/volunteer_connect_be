import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Message } from './entities/message.entity';
import { Event } from 'src/events/entities/event.entity';
import { Volunteer } from 'src/volunteers/entities/volunteer.entity';
import { EventVolunteer } from 'src/event-volunteers/entities/event-volunteer.entity';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Event, Volunteer, EventVolunteer, User]),
    JwtModule.register({}),
  ],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
})
export class ChatModule {}

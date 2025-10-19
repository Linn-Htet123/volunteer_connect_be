/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { Event } from 'src/events/entities/event.entity';
import { User } from 'src/users/entities/user.entity';
import { Volunteer } from 'src/volunteers/entities/volunteer.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,

    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Volunteer)
    private readonly volunteerRepo: Repository<Volunteer>,
  ) {}

  async saveMessage(
    eventId: number,
    senderId: number,
    content: string,
    volunteerId?: number,
  ): Promise<Message> {
    if (!content?.trim()) {
      throw new BadRequestException('Message content cannot be empty');
    }

    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const sender = await this.userRepo.findOne({ where: { id: senderId } });
    if (!sender) throw new NotFoundException('Sender (user) not found');

    let volunteer: Volunteer | null = null;
    if (volunteerId) {
      volunteer = await this.volunteerRepo.findOne({
        where: { id: volunteerId },
        relations: ['user'],
      });
      if (!volunteer) throw new NotFoundException('Volunteer not found');
    }

    const message = this.messageRepo.create({
      event,
      sender,
      volunteer: volunteer ?? undefined,
      content: content.trim(),
    });

    return await this.messageRepo.save(message);
  }

  async getMessagesForEvent(eventId: number): Promise<any[]> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const messages = await this.messageRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoin('volunteers', 'volunteer', 'volunteer.user_id = sender.id')
      .select([
        'message.id',
        'message.content',
        'message.created_at',
        'sender.id',
        'sender.name',
        'sender.email',
        'sender.phone',
        'sender.role',
        'volunteer.date_of_birth',
        'volunteer.address',
        'volunteer.emergency_contact',
        'volunteer.onboarding_status',
      ])
      .where('message.eventId = :eventId', { eventId })
      .orderBy('message.created_at', 'ASC')
      .getRawMany();

    // Reformat result into a cleaner structure
    return messages.map((m) => ({
      id: m.message_id,
      content: m.message_content,
      created_at: m.message_created_at,
      sender: {
        id: m.sender_id,
        name: m.sender_name,
        email: m.sender_email,
        phone: m.sender_phone,
        role: m.sender_role,
        date_of_birth: m.volunteer_date_of_birth,
        address: m.volunteer_address,
        emergency_contact: m.volunteer_emergency_contact,
        onboarding_status: m.volunteer_onboarding_status,
      },
    }));
  }

  async getMessagesByUser(senderId: number): Promise<Message[]> {
    return this.messageRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.event', 'event')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('sender.id = :senderId', { senderId })
      .orderBy('message.created_at', 'DESC')
      .getMany();
  }
}

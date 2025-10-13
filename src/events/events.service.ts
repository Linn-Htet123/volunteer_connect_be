import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/enum/user.enum';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(
    createEventDto: CreateEventDto,
    file?: Express.Multer.File,
    currentUser?: { role: UserRole },
  ): Promise<Event> {
    const { created_by, ...eventData } = createEventDto;

    if (currentUser?.role !== UserRole.ORGANIZER) {
      throw new ForbiddenException('Only organizers can create events');
    }

    const user = await this.userRepo.findOne({ where: { id: created_by } });
    if (!user) {
      throw new NotFoundException(`User with ID ${created_by} not found`);
    }

    const event = this.eventRepo.create({
      ...eventData,
      image_url: file ? `/uploads/${file.filename}` : '',
      created_by: user,
    });

    return await this.eventRepo.save(event);
  }

  async findAll(): Promise<Event[]> {
    return this.eventRepo.find({
      relations: ['created_by'],
      order: { start_date: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventRepo.findOne({
      where: { id },
      relations: ['created_by'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);

    Object.assign(event, updateEventDto);
    return await this.eventRepo.save(event);
  }

  async remove(eventId: number, currentUser: { sub: number }) {
    const event = await this.eventRepo.findOne({
      where: { id: eventId },
      relations: ['created_by'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    console.log('Current User:', currentUser);
    console.log('Event Created By:', event.created_by);
    if (event.created_by.id !== currentUser.sub) {
      throw new ForbiddenException('You are not allowed to delete this event');
    }

    await this.eventRepo.remove(event);
    return { message: 'Event deleted successfully' };
  }
}

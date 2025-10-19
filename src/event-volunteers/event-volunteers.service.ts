import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  EventVolunteer,
  VolunteerEventStatus,
} from './entities/event-volunteer.entity';
import { CreateEventVolunteerDto } from './dto/create-event-volunteer.dto';
import { UpdateEventVolunteerDto } from './dto/update-event-volunteer.dto';
import { Event } from 'src/events/entities/event.entity';
import { Volunteer } from 'src/volunteers/entities/volunteer.entity';

@Injectable()
export class EventVolunteersService {
  constructor(
    @InjectRepository(EventVolunteer)
    private readonly eventVolunteerRepo: Repository<EventVolunteer>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(Volunteer)
    private readonly volunteerRepo: Repository<Volunteer>,
  ) {}

  async create(createDto: CreateEventVolunteerDto): Promise<EventVolunteer[]> {
    const { event_id, volunteer_ids, status } = createDto;

    // 1️⃣ Find the event
    const event = await this.eventRepo.findOne({
      where: { id: event_id },
      relations: ['event_volunteers'],
    });

    if (!event) throw new NotFoundException(`Event ${event_id} not found`);

    // 2️⃣ Check event capacity
    if (event.capacity && event.event_volunteers.length >= event.capacity) {
      throw new BadRequestException('Event has reached maximum capacity');
    }

    // 3️⃣ Fetch volunteers
    const volunteers = await this.volunteerRepo.find({
      where: { id: In(volunteer_ids) },
    });

    if (volunteers.length !== volunteer_ids.length) {
      throw new BadRequestException('Some volunteer IDs are invalid');
    }

    // 4️⃣ Check for already joined volunteers
    const existing = await this.eventVolunteerRepo.find({
      where: {
        event: { id: event_id },
        volunteer: { id: In(volunteer_ids) },
      },
    });

    if (existing.length > 0) {
      throw new BadRequestException(`Volunteers already joined this event`);
    }

    // 5️⃣ Check again if adding these volunteers exceeds capacity
    const totalAfterAdding = event.event_volunteers.length + volunteers.length;
    if (event.capacity && totalAfterAdding > event.capacity) {
      throw new BadRequestException(
        `Cannot add ${volunteers.length} volunteers. Event capacity exceeded.`,
      );
    }

    // 6️⃣ Create new event-volunteer records
    const newRecords = volunteers.map((volunteer) =>
      this.eventVolunteerRepo.create({
        event,
        volunteer,
        status: status ?? VolunteerEventStatus.PENDING,
      }),
    );

    // 7️⃣ Save all valid records
    return await this.eventVolunteerRepo.save(newRecords);
  }

  async findAll() {
    return this.eventVolunteerRepo.find({
      relations: ['event', 'volunteer', 'volunteer.user'],
    });
  }

  async findOne(id: number) {
    const record = await this.eventVolunteerRepo.findOne({
      where: { id },
      relations: ['event', 'volunteer', 'volunteer.user'],
    });
    if (!record) throw new NotFoundException('EventVolunteer not found');
    return record;
  }

  async findVolunteersInEvent(eventId: number) {
    // Check if event exists
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException(`Event ${eventId} not found`);

    // Get all volunteers for this event
    const volunteers = await this.eventVolunteerRepo.find({
      where: { event: { id: eventId }, status: VolunteerEventStatus.APPROVED },
      relations: ['volunteer', 'volunteer.user'], // load the user info
    });

    // Map to return id and name
    return volunteers.map((ev) => ({
      value: ev.volunteer.id,
      label: ev.volunteer.user.name, // assuming volunteer.user.name exists
      status: ev.status,
    }));
  }

  async update(id: number, dto: UpdateEventVolunteerDto) {
    const record = await this.findOne(id);
    Object.assign(record, dto);
    return this.eventVolunteerRepo.save(record);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    await this.eventVolunteerRepo.remove(record);
    return { message: 'Volunteer removed from event' };
  }

  async findEventsByUserId(userId: number) {
    if (!userId || isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const volunteer = await this.volunteerRepo.findOne({
      where: { user: { id: userId } },
      relations: ['event_volunteers', 'event_volunteers.event'],
    });

    if (!volunteer) {
      throw new NotFoundException('Volunteer not found for this user');
    }

    // Return both event and status info
    return volunteer.event_volunteers.map((ev) => ({
      id: ev.event.id,
      name: ev.event.name,
      description: ev.event.description,
      location: ev.event.location,
      start_date: ev.event.start_date,
      end_date: ev.event.end_date,
      image_url: ev.event.image_url,
      map_url: ev.event.map_url,
      capacity: ev.event.capacity,
      status: ev.status,
    }));
  }
  async findEventVolunteers(eventId: number) {
    const eventVolunteers = await this.eventVolunteerRepo.find({
      where: { event: { id: eventId } },
      relations: ['volunteer', 'volunteer.user', 'event'],
      order: { joined_at: 'DESC' },
    });

    return eventVolunteers.map((ev) => ({
      id: ev.id,
      user: {
        id: ev.volunteer.user.id,
        name: ev.volunteer.user.name,
        email: ev.volunteer.user.email,
        phone: ev.volunteer.user.phone,
        role: ev.volunteer.user.role,
        createdAt: ev.volunteer.user.createdAt,
        updatedAt: ev.volunteer.user.updatedAt,
      },
      date_of_birth: ev.volunteer.date_of_birth,
      address: ev.volunteer.address,
      emergency_contact: ev.volunteer.emergency_contact,
      status: ev.status,
      joined_at: ev.joined_at,
      volunteer_id: ev.volunteer.id,
    }));
  }

  /**
   * Approve a volunteer for an event
   */
  async approveEventVolunteer(eventId: number, volunteerId: number) {
    const eventVolunteer = await this.eventVolunteerRepo.findOne({
      where: {
        event: { id: eventId },
        volunteer: { id: volunteerId },
      },
      relations: ['volunteer', 'volunteer.user', 'event'],
    });

    if (!eventVolunteer) {
      throw new NotFoundException(
        `Volunteer application not found for event ${eventId} and volunteer ${volunteerId}`,
      );
    }

    eventVolunteer.status = VolunteerEventStatus.APPROVED;
    await this.eventVolunteerRepo.save(eventVolunteer);

    return {
      message: 'Volunteer approved successfully',
      data: eventVolunteer,
    };
  }

  /**
   * Reject a volunteer for an event
   */
  async rejectEventVolunteer(eventId: number, volunteerId: number) {
    const eventVolunteer = await this.eventVolunteerRepo.findOne({
      where: {
        event: { id: eventId },
        volunteer: { id: volunteerId },
      },
      relations: ['volunteer', 'volunteer.user', 'event'],
    });

    if (!eventVolunteer) {
      throw new NotFoundException(
        `Volunteer application not found for event ${eventId} and volunteer ${volunteerId}`,
      );
    }

    eventVolunteer.status = VolunteerEventStatus.REJECTED;
    await this.eventVolunteerRepo.save(eventVolunteer);

    return {
      message: 'Volunteer rejected successfully',
      data: eventVolunteer,
    };
  }
}

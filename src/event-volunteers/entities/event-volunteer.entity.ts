/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Event } from 'src/events/entities/event.entity';
import { Volunteer } from 'src/volunteers/entities/volunteer.entity';

export enum VolunteerEventStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  COMPLETED = 'Completed',
}

@Entity({ name: 'event_volunteers' })
@Unique(['event', 'volunteer'])
export class EventVolunteer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event, (event) => event.event_volunteers, {
    onDelete: 'CASCADE',
  })
  event: Event;

  @ManyToOne(() => Volunteer, (volunteer) => volunteer.event_volunteers, {
    onDelete: 'CASCADE',
  })
  volunteer: Volunteer;

  @CreateDateColumn({ name: 'joined_at' })
  joined_at: Date;

  @Column({
    type: 'enum',
    enum: VolunteerEventStatus,
    default: VolunteerEventStatus.PENDING,
  })
  status: VolunteerEventStatus;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { EventStatus } from '../enums/event.enum';
import { Task } from 'src/tasks/entities/task.entity';
import { EventVolunteer } from 'src/event-volunteers/entities/event-volunteer.entity';

@Entity({ name: 'events' })
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 200, nullable: true })
  location?: string;

  @Column({ type: 'datetime' })
  start_date: Date;

  @Column({ type: 'datetime', nullable: true })
  end_date?: Date;

  @Column({ type: 'text', nullable: true })
  image_url?: string;

  @Column({ type: 'text', nullable: true })
  map_url?: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  capacity?: number;

  @ManyToOne(() => User, (user) => user.events, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  created_by: User;

  @OneToMany(() => Task, (task) => task.event)
  tasks: Task[];

  @OneToMany(() => EventVolunteer, (ev) => ev.event)
  event_volunteers: EventVolunteer[];

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.UPCOMING,
  })
  status: EventStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}

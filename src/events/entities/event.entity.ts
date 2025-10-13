import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { EventStatus } from '../enums/event.enum';

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

  @ManyToOne(() => User, (user) => user.events, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  created_by: User;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.UPCOMING,
  })
  status: EventStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}

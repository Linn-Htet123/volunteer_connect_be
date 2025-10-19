import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Event } from 'src/events/entities/event.entity';
import { User } from 'src/users/entities/user.entity';
import { TaskStatus } from '../enum/task.enum';
import { VolunteerTask } from './volunteer-task.entity';

@Entity({ name: 'tasks' })
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event, (event) => event.tasks, { onDelete: 'CASCADE' })
  event: Event;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 150, nullable: true })
  location?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  created_by: User;

  @Column({ type: 'datetime', nullable: true })
  start_date?: Date;

  @Column({ type: 'datetime', nullable: true })
  end_date?: Date;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.OPEN })
  status: TaskStatus;

  @OneToMany(() => VolunteerTask, (vt) => vt.task)
  volunteer_tasks: VolunteerTask[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}

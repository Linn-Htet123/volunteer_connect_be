import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
  Unique,
} from 'typeorm';
import { Volunteer } from 'src/volunteers/entities/volunteer.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { VolunteerTaskStatus } from '../enum/volunteer-task.entity';

@Entity({ name: 'volunteer_tasks' })
@Unique(['volunteer', 'task'])
export class VolunteerTask {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Volunteer, (volunteer) => volunteer.volunteer_tasks, {
    onDelete: 'CASCADE',
  })
  volunteer: Volunteer;

  @ManyToOne(() => Task, (task) => task.volunteer_tasks, {
    onDelete: 'CASCADE',
  })
  task: Task;

  @CreateDateColumn({ name: 'assigned_at' })
  assigned_at: Date;

  @Column({ type: 'datetime', nullable: true })
  start: Date;

  @Column({ type: 'datetime', nullable: true })
  end: Date;

  @Column({
    type: 'enum',
    enum: VolunteerTaskStatus,
    default: VolunteerTaskStatus.ASSIGNED,
  })
  status: VolunteerTaskStatus;
}

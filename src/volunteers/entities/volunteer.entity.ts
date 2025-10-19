import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { EventVolunteer } from 'src/event-volunteers/entities/event-volunteer.entity';
import { OnboardingStatus } from '../enum/volunteer.enum';
import { VolunteerCertification } from './volunteer-certification.entity';
import { VolunteerTask } from 'src/tasks/entities/volunteer-task.entity';

@Entity({ name: 'volunteers' })
export class Volunteer {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date', nullable: true })
  date_of_birth?: Date;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  emergency_contact?: string;

  @Column({
    type: 'enum',
    enum: OnboardingStatus,
    default: OnboardingStatus.PENDING,
  })
  onboarding_status: OnboardingStatus;

  @OneToMany(() => EventVolunteer, (ev) => ev.volunteer)
  event_volunteers: EventVolunteer[];

  @OneToMany(() => VolunteerTask, (ev) => ev.volunteer)
  volunteer_tasks: VolunteerTask[];

  @OneToMany(() => VolunteerCertification, (cert) => cert.volunteer)
  certifications: VolunteerCertification[];
}

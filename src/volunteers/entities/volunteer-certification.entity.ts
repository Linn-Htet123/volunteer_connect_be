import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Volunteer } from 'src/volunteers/entities/volunteer.entity';

@Entity({ name: 'volunteer_certifications' })
export class VolunteerCertification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Volunteer, (volunteer) => volunteer.certifications, {
    onDelete: 'CASCADE',
  })
  volunteer: Volunteer;

  @Column({ type: 'varchar', length: 150 })
  certification_name: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  issued_by?: string;

  @Column({ type: 'date', nullable: true })
  issue_date?: Date;

  @Column({ type: 'date', nullable: true })
  expiry_date?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  document_url?: string;
}

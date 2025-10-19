// src/event-resources/entities/event-resource.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class EventResource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  eventId: number;

  @Column()
  name: string;

  @Column()
  path: string;

  @Column({ nullable: true })
  size: number;

  @Column({ nullable: true })
  mimeType: string;

  @Column()
  uploaderId: number;

  @CreateDateColumn()
  uploadedAt: Date;
}

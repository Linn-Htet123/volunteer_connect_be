/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventResource } from './entities/event-resource.entity';
import { CreateEventResourceDto } from './dto/create-event-resource.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EventResourcesService {
  constructor(
    @InjectRepository(EventResource)
    private resourceRepo: Repository<EventResource>,
  ) {}

  async create(dto: CreateEventResourceDto, uploader: any) {
    const resource = this.resourceRepo.create({
      ...dto,
      uploaderId: uploader.sub,
      uploadedAt: new Date(),
    });
    return this.resourceRepo.save(resource);
  }

  async list(eventId: number) {
    return this.resourceRepo.find({
      where: { eventId },
      order: { uploadedAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const resource = await this.resourceRepo.findOne({ where: { id } });
    if (!resource)
      throw new NotFoundException(`Resource with ID ${id} not found`);
    return resource;
  }

  async update(id: number, updateData: Partial<EventResource>) {
    if (Object.keys(updateData).length === 0)
      throw new Error('Update values cannot be empty');
    await this.resourceRepo.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number, user: any) {
    const resource = await this.findOne(id);
    if (!resource) throw new NotFoundException('Resource not found');

    // Optional: ensure only uploader or organizer can delete
    if (resource.uploaderId !== user.sub) {
      throw new ForbiddenException('You are not allowed to delete this file');
    }

    // Delete file from disk if exists
    const filePath = path.join(process.cwd(), 'uploads', resource.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove record from DB
    await this.resourceRepo.delete(id);
    return { message: 'File deleted successfully' };
  }
}

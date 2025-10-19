import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Volunteer } from './entities/volunteer.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { VolunteerCertification } from './entities/volunteer-certification.entity';
import { CreateVolunteerCertificationDto } from './dto/create-volunteer-certification.dto';
import { UpdateVolunteerCertificationDto } from './dto/update-volunteer-certification.dto';

@Injectable()
export class VolunteersService {
  constructor(
    @InjectRepository(Volunteer)
    private readonly volunteerRepo: Repository<Volunteer>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(VolunteerCertification)
    private readonly certRepo: Repository<VolunteerCertification>,
  ) {}

  async create(createVolunteerDto: CreateVolunteerDto): Promise<Volunteer> {
    const { user_id, ...profileData } = createVolunteerDto;

    const user = await this.userRepo.findOne({ where: { id: user_id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    const existingProfile = await this.volunteerRepo.findOne({
      where: { user: { id: user_id } },
    });

    if (existingProfile) {
      throw new BadRequestException(
        `Volunteer profile already exists for this user`,
      );
    }

    const volunteer = this.volunteerRepo.create({
      ...profileData,
      user,
    });

    return await this.volunteerRepo.save(volunteer);
  }

  async findAll(): Promise<Volunteer[]> {
    return await this.volunteerRepo.find({
      relations: ['user', 'event_volunteers', 'event_volunteers.event'],
      order: { id: 'ASC' },
    });
  }

  async findByUserId(userId: number): Promise<Volunteer | null> {
    return this.volunteerRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'event_volunteers', 'event_volunteers.event'],
    });
  }

  async findOne(id: number): Promise<Volunteer> {
    const volunteer = await this.volunteerRepo.findOne({
      where: { id },
      relations: ['user', 'event_volunteers', 'event_volunteers.event'],
    });

    if (!volunteer) {
      throw new NotFoundException(`Volunteer with ID ${id} not found`);
    }

    return volunteer;
  }

  async update(
    id: number,
    updateVolunteerDto: UpdateVolunteerDto,
  ): Promise<Volunteer> {
    const volunteer = await this.findOne(id);
    Object.assign(volunteer, updateVolunteerDto);
    return await this.volunteerRepo.save(volunteer);
  }

  async remove(id: number): Promise<void> {
    const volunteer = await this.findOne(id);
    await this.volunteerRepo.remove(volunteer);
  }

  async volunteerCertificateCreate(
    dto: CreateVolunteerCertificationDto,
  ): Promise<VolunteerCertification> {
    const volunteer = await this.volunteerRepo.findOne({
      where: { id: dto.volunteer_id },
    });

    if (!volunteer)
      throw new NotFoundException(`Volunteer ${dto.volunteer_id} not found`);

    const cert = this.certRepo.create({
      ...dto,
      volunteer,
    });

    return this.certRepo.save(cert);
  }

  async volunteerCertificateFindAll(): Promise<VolunteerCertification[]> {
    return this.certRepo.find({ relations: ['volunteer', 'volunteer.user'] });
  }

  async volunteerCertificatefindByVolunteer(
    volunteerId: number,
  ): Promise<VolunteerCertification[]> {
    return this.certRepo.find({
      where: { volunteer: { id: volunteerId } },
      relations: ['volunteer', 'volunteer.user'],
    });
  }

  async volunteerCertificateUpdate(
    id: number,
    dto: UpdateVolunteerCertificationDto,
  ): Promise<VolunteerCertification> {
    const cert = await this.certRepo.findOne({ where: { id } });
    if (!cert) throw new NotFoundException(`Certification ${id} not found`);

    Object.assign(cert, dto);
    return this.certRepo.save(cert);
  }

  async volunteerCertificateRemove(id: number): Promise<void> {
    const cert = await this.certRepo.findOne({ where: { id } });
    if (!cert) throw new NotFoundException(`Certification ${id} not found`);
    await this.certRepo.remove(cert);
  }
}

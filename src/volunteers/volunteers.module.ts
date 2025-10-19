import { Module } from '@nestjs/common';
import { VolunteersService } from './volunteers.service';
import { VolunteersController } from './volunteers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Volunteer } from './entities/volunteer.entity';
import { User } from 'src/users/entities/user.entity';
import { VolunteerCertification } from './entities/volunteer-certification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Volunteer, User, VolunteerCertification]),
  ],
  controllers: [VolunteersController],
  providers: [VolunteersService],
  exports: [VolunteersService],
})
export class VolunteersModule {}

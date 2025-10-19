import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { VolunteersService } from './volunteers.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateVolunteerCertificationDto } from './dto/create-volunteer-certification.dto';
import { UpdateVolunteerCertificationDto } from './dto/update-volunteer-certification.dto';

@UseGuards(AuthGuard)
@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Post()
  create(@Body() createVolunteerDto: CreateVolunteerDto) {
    return this.volunteersService.create(createVolunteerDto);
  }

  @Get()
  findAll() {
    return this.volunteersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.volunteersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVolunteerDto: UpdateVolunteerDto,
  ) {
    return this.volunteersService.update(id, updateVolunteerDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.volunteersService.remove(id);
  }

  @Post('certifications')
  createVolunteerCertification(@Body() dto: CreateVolunteerCertificationDto) {
    return this.volunteersService.volunteerCertificateCreate(dto);
  }

  @Get('certifications')
  findAllVolunteerCertification() {
    return this.volunteersService.volunteerCertificateFindAll();
  }

  @Get('volunteer/:id')
  findByVolunteeCertification(@Param('id', ParseIntPipe) id: number) {
    return this.volunteersService.volunteerCertificatefindByVolunteer(id);
  }

  @Patch('certifications/:id')
  updateVolunteerCertification(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVolunteerCertificationDto,
  ) {
    return this.volunteersService.volunteerCertificateUpdate(id, dto);
  }

  @Delete(':id')
  removeVolunteerCertification(@Param('id', ParseIntPipe) id: number) {
    return this.volunteersService.volunteerCertificateRemove(id);
  }
}

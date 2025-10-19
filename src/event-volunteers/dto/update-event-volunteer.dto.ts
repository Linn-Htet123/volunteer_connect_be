import { PartialType } from '@nestjs/mapped-types';
import { CreateEventVolunteerDto } from './create-event-volunteer.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { VolunteerEventStatus } from '../entities/event-volunteer.entity';

export class UpdateEventVolunteerDto extends PartialType(
  CreateEventVolunteerDto,
) {
  @IsOptional()
  @IsEnum(VolunteerEventStatus)
  status?: VolunteerEventStatus;
}

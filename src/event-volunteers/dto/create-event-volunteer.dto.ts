import {
  IsInt,
  IsArray,
  ArrayNotEmpty,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { VolunteerEventStatus } from '../entities/event-volunteer.entity';

export class CreateEventVolunteerDto {
  @IsInt()
  event_id: number;

  @IsArray()
  @ArrayNotEmpty()
  volunteer_ids: number[]; // multiple volunteers at once

  @IsOptional()
  @IsEnum(VolunteerEventStatus)
  status?: VolunteerEventStatus;
}

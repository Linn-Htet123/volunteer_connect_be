import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsInt,
} from 'class-validator';
import { EventStatus } from '../enums/event.enum';

export class CreateEventDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  location: string;

  @IsString()
  image_url: string;

  @IsString()
  map_url?: string;

  @IsDateString()
  start_date: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsInt()
  created_by: number;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}

import {
  IsInt,
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { TaskStatus } from '../enum/task.enum';

export class CreateTaskDto {
  @IsInt()
  event_id: number;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  location?: string;

  @IsInt()
  created_by: number;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  status?: TaskStatus;
}

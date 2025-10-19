import { IsInt, IsOptional } from 'class-validator';
import { VolunteerTaskStatus } from '../enum/volunteer-task.entity';

export class CreateVolunteerTaskDto {
  @IsInt()
  volunteer_id: number;

  @IsOptional()
  @IsInt()
  task_id: number;

  @IsOptional()
  status?: VolunteerTaskStatus;
}

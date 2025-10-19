import { PartialType } from '@nestjs/mapped-types';
import { CreateVolunteerTaskDto } from './create-volunteer-task.dto';

export class UpdateVolunteerTaskDto extends PartialType(
  CreateVolunteerTaskDto,
) {}

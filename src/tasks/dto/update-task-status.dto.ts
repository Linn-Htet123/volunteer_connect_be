import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '../enum/task.enum';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  @IsNotEmpty()
  status: TaskStatus;
}

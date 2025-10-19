import { IsArray, IsInt, IsString } from 'class-validator';

export class CreateAssignVolunteers {
  @IsArray()
  @IsInt({ each: true })
  volunteer_ids: number[];

  @IsString()
  start: string;

  @IsString()
  end: string;
}

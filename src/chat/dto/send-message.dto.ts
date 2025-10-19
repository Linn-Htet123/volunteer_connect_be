import { IsInt, IsString } from 'class-validator';

export class SendMessageDto {
  @IsInt()
  eventId: number;

  @IsString()
  content: string;
}

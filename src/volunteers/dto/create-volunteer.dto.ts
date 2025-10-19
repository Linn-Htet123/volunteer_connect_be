import {
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { OnboardingStatus } from '../enum/volunteer.enum';

export class CreateVolunteerDto {
  @IsInt()
  user_id: number;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergency_contact?: string;

  @IsOptional()
  onboarding_status?: OnboardingStatus;
}

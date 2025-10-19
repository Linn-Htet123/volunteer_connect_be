import {
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CreateVolunteerCertificationDto {
  @IsInt()
  volunteer_id: number;

  @IsString()
  @MaxLength(150)
  certification_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  issued_by?: string;

  @IsOptional()
  @IsDateString()
  issue_date?: string;

  @IsOptional()
  @IsDateString()
  expiry_date?: string;

  @IsOptional()
  @IsString()
  document_url?: string;
}

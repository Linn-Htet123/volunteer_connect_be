import { PartialType } from '@nestjs/mapped-types';
import { CreateVolunteerCertificationDto } from './create-volunteer-certification.dto';

export class UpdateVolunteerCertificationDto extends PartialType(
  CreateVolunteerCertificationDto,
) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreateEventResourceDto } from './create-event-resource.dto';

export class UpdateEventResourceDto extends PartialType(CreateEventResourceDto) {}

// src/event-resources/dto/create-event-resource.dto.ts
export class CreateEventResourceDto {
  eventId: number;
  name: string;
  path: string;
  size?: number;
  mimeType?: string;
}

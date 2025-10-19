import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { EventVolunteersService } from './event-volunteers.service';
import { CreateEventVolunteerDto } from './dto/create-event-volunteer.dto';
import { UpdateEventVolunteerDto } from './dto/update-event-volunteer.dto';

@Controller('event-volunteers')
export class EventVolunteersController {
  constructor(
    private readonly eventVolunteersService: EventVolunteersService,
  ) {}

  @Post('apply')
  create(@Body() dto: CreateEventVolunteerDto) {
    return this.eventVolunteersService.create(dto);
  }

  @Get()
  findAll() {
    return this.eventVolunteersService.findAll();
  }

  @Get('my-events')
  getMyEvents(@Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.eventVolunteersService.findEventsByUserId(req.user.sub);
  }

  @Get('/:id/volunteers')
  findVolunteersInEvent(@Param('id') id: number) {
    return this.eventVolunteersService.findVolunteersInEvent(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventVolunteersService.findOne(id);
  }

  @Patch(':id/')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventVolunteerDto,
  ) {
    return this.eventVolunteersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventVolunteersService.remove(id);
  }
  @Get('volunteers/:eventId')
  findEventVolunteers(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.eventVolunteersService.findEventVolunteers(eventId);
  }

  // ✅ NEW: Approve a volunteer for an event
  @Patch(':eventId/volunteer/:volunteerId/approve')
  approveVolunteer(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('volunteerId', ParseIntPipe) volunteerId: number,
  ) {
    return this.eventVolunteersService.approveEventVolunteer(
      eventId,
      volunteerId,
    );
  }

  // ✅ NEW: Reject a volunteer for an event
  @Patch(':eventId/volunteer/:volunteerId/reject')
  rejectVolunteer(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('volunteerId', ParseIntPipe) volunteerId: number,
  ) {
    return this.eventVolunteersService.rejectEventVolunteer(
      eventId,
      volunteerId,
    );
  }
}

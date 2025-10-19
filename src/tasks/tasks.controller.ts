import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateVolunteerTaskDto } from './dto/create-volunteer-task.dto';
import { CreateAssignVolunteers } from './dto/create-assign-volunteers';
import { VolunteerTaskStatus } from './enum/volunteer-task.entity';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { Task } from './entities/task.entity';

@UseGuards(AuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // --- Task CRUD ---
  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskStatusDto,
  ): Promise<Task> {
    return this.tasksService.updateStatus(id, dto.status);
  }

  @Patch(':id/volunteers/bulk')
  updateAssignedVolunteersBulk(
    @Param('id') task_id: number,
    @Body()
    dto: {
      volunteer_ids: number[];
      start?: string;
      end?: string;
      status?: VolunteerTaskStatus;
    },
  ) {
    console.log('task_id:', task_id, typeof task_id);
    return this.tasksService.updateAssignedVolunteersBulk(task_id, dto);
  }
  // --- Volunteer Assignments ---
  @Post(':id/volunteers')
  assignVolunteer(
    @Param('id', ParseIntPipe) task_id: number,
    @Body() dto: CreateVolunteerTaskDto,
  ) {
    return this.tasksService.assignVolunteer(task_id, dto);
  }

  @Post(':id/volunteers/multiple')
  assignMultipleVolunteers(
    @Param('id', ParseIntPipe) task_id: number,
    @Body() dto: CreateAssignVolunteers,
  ) {
    return this.tasksService.assignMultipleVolunteers(task_id, dto);
  }

  @Get(':id/volunteers')
  getVolunteers(@Param('id', ParseIntPipe) task_id: number) {
    return this.tasksService.getAssignedVolunteersForTask(task_id);
  }

  @Patch(':id/volunteers/:volunteerId')
  updateAssignedVolunteer(
    @Param('id', ParseIntPipe) task_id: number,
    @Param('volunteerId', ParseIntPipe) volunteer_id: number,
    @Body() dto: { start?: string; end?: string; status?: VolunteerTaskStatus },
  ) {
    return this.tasksService.updateAssignedVolunteers(
      task_id,
      volunteer_id,
      dto,
    );
  }

  @Delete(':id/volunteers')
  removeAssignedVolunteers(
    @Param('id', ParseIntPipe) task_id: number,
    @Body() dto: { volunteer_ids: number[] },
  ) {
    return this.tasksService.removeAssignedVolunteers(
      task_id,
      dto.volunteer_ids,
    );
  }

  @Get('event/:eventId/volunteer/:volunteerId')
  getTasksForVolunteerInEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('volunteerId', ParseIntPipe) volunteerId: number,
  ) {
    return this.tasksService.getTasksForVolunteerInEvent(volunteerId, eventId);
  }
}

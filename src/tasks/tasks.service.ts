/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { Event } from 'src/events/entities/event.entity';
import { User } from 'src/users/entities/user.entity';
import { Volunteer } from 'src/volunteers/entities/volunteer.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { VolunteerTask } from './entities/volunteer-task.entity';
import { CreateVolunteerTaskDto } from './dto/create-volunteer-task.dto';
import { VolunteerTaskStatus } from './enum/volunteer-task.entity';
import { MailService } from 'src/mail/mail.service';
import { CreateAssignVolunteers } from './dto/create-assign-volunteers';
import { TaskStatus } from './enum/task.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Volunteer)
    private readonly volunteerRepo: Repository<Volunteer>,
    @InjectRepository(VolunteerTask)
    private readonly vtRepo: Repository<VolunteerTask>,
    private readonly mailService: MailService,
  ) {}

  // --------- Task CRUD ----------
  async create(dto: CreateTaskDto): Promise<Task> {
    const event = await this.eventRepo.findOne({ where: { id: dto.event_id } });
    if (!event) throw new NotFoundException(`Event ${dto.event_id} not found`);

    const user = await this.userRepo.findOne({ where: { id: dto.created_by } });
    if (!user) throw new NotFoundException(`User ${dto.created_by} not found`);

    const task = this.taskRepo.create({ ...dto, event, created_by: user });
    const savedTask = await this.taskRepo.save(task);

    // ---- Send Email Notification ----
    try {
      await this.mailService.sendMail(
        user.email,
        `New Task Created: ${savedTask.title}`,
        './task-assigned',
        {
          creatorName: user.name,
          taskTitle: savedTask.title,
          eventName: event.name,
          startDate: savedTask.start_date,
          endDate: savedTask.end_date,
          location: savedTask.location,
        },
      );

      console.log(`Task creation email sent to ${user.email}`);
    } catch (error) {
      console.error(`Failed to send task creation email: ${error}`);
    }

    return savedTask;
  }

  async findAll(): Promise<Task[]> {
    return this.taskRepo.find({
      relations: [
        'event',
        'created_by',
        'volunteer_tasks',
        'volunteer_tasks.volunteer',
      ],
      order: { start_date: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: [
        'event',
        'created_by',
        'volunteer_tasks',
        'volunteer_tasks.volunteer',
      ],
    });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  async update(id: number, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    Object.assign(task, dto);
    return this.taskRepo.save(task);
  }

  async updateStatus(id: number, status: TaskStatus): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException(`Task ${id} not found`);

    task.status = status;
    return this.taskRepo.save(task);
  }

  async remove(id: number): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepo.remove(task);
  }

  // --------- Volunteer Assignments ----------
  async assignVolunteer(
    task_id: number,
    dto: CreateVolunteerTaskDto,
  ): Promise<VolunteerTask> {
    const task = await this.findOne(task_id);

    const volunteer = await this.volunteerRepo.findOne({
      where: { id: dto.volunteer_id },
    });
    if (!volunteer)
      throw new NotFoundException(`Volunteer ${dto.volunteer_id} not found`);

    const existing = await this.vtRepo.findOne({ where: { task, volunteer } });
    if (existing)
      throw new BadRequestException('Volunteer already assigned to this task');

    const assignment = this.vtRepo.create({
      task,
      volunteer,
      status: dto.status || VolunteerTaskStatus.ASSIGNED,
    });

    return this.vtRepo.save(assignment);
  }

  // Add this method to your TasksService class

  async assignMultipleVolunteers(
    task_id: number,
    dto: CreateAssignVolunteers,
  ): Promise<VolunteerTask[]> {
    const { volunteer_ids, start, end } = dto;

    const task = await this.findOne(task_id);
    if (!task) throw new NotFoundException(`Task ${task_id} not found`);

    // Fetch all volunteers in one query with user relations
    const volunteers = await this.volunteerRepo.find({
      where: { id: In(volunteer_ids) },
      relations: ['user'], // Add user relation to get email and name
    });

    if (!volunteers.length) {
      throw new NotFoundException(`No valid volunteers found`);
    }

    // Fetch existing assignments to avoid duplicates
    const existingAssignments = await this.vtRepo.find({
      where: {
        task: { id: task_id },
        volunteer: { id: In(volunteers.map((v) => v.id)) },
      },
      relations: ['volunteer', 'task'],
    });

    const existingVolunteerIds = existingAssignments.map((a) => a.volunteer.id);

    // Filter out volunteers already assigned
    const newAssignments: VolunteerTask[] = volunteers
      .filter((v) => !existingVolunteerIds.includes(v.id))
      .map((v) =>
        this.vtRepo.create({
          task,
          volunteer: v,
          start: new Date(start),
          end: new Date(end),
          status: VolunteerTaskStatus.ASSIGNED,
        }),
      );

    if (!newAssignments.length) {
      throw new BadRequestException('Already assigned to this task');
    }

    try {
      // Save all new assignments at once
      const savedAssignments = await this.vtRepo.save(newAssignments);

      // ---- Send Email Notifications to All Assigned Volunteers ----
      const emailPromises = savedAssignments.map(async (assignment) => {
        try {
          await this.mailService.sendMail(
            assignment.volunteer.user.email,
            `You've Been Assigned to: ${task.title}`,
            './task-assigned', // Template name
            {
              volunteerName: assignment.volunteer.user.name,
              taskTitle: task.title,
              taskDescription: task.description,
              eventName: task.event.name,
              taskLocation: task.location,
              taskStartDate: task.start_date,
              taskEndDate: task.end_date,
              assignmentStart: assignment.start,
              assignmentEnd: assignment.end,
            },
          );

          console.log(
            `Assignment email sent to ${assignment.volunteer.user.email}`,
          );
        } catch (error) {
          console.error(
            `Failed to send assignment email to ${assignment.volunteer.user.email}: ${error}`,
          );
          // Continue with other emails even if one fails
        }
      });

      // Execute all email sends concurrently
      await Promise.allSettled(emailPromises);

      return savedAssignments;
    } catch (error) {
      // Rollback any partial changes if save fails
      await this.vtRepo.remove(newAssignments);
      throw new BadRequestException(
        'Failed to assign volunteers: ' + error.message,
      );
    }
  }
  // tasks.service.ts
  async getAssignedVolunteersForTask(taskId: number) {
    const assignments = await this.vtRepo.find({
      where: { task: { id: taskId } },
      relations: ['volunteer', 'volunteer.user'],
    });

    const grouped: Record<string, any> = {};
    assignments.forEach((a) => {
      const key = `${a.start.toISOString()}_${a.end.toISOString()}`;
      if (!grouped[key])
        grouped[key] = {
          start: a.start,
          end: a.end,
          volunteerIds: [],
          title: '',
        };
      grouped[key].volunteerIds.push(a.volunteer.id);
      grouped[key].title = grouped[key].title
        ? grouped[key].title + ', ' + a.volunteer.user.name
        : a.volunteer.user.name;
    });

    return Object.entries(grouped).map(([_, val], idx) => ({
      id: String(idx + 1),
      title: val.title,
      start: val.start.toISOString(),
      end: val.end.toISOString(),
      volunteerIds: val.volunteerIds,
    }));
  }

  async removeAssignedVolunteers(
    task_id: number,
    volunteer_ids: number[],
  ): Promise<void> {
    const task = await this.findOne(task_id);
    if (!task) throw new NotFoundException(`Task ${task_id} not found`);

    const assignments = await this.vtRepo.find({
      where: {
        task: { id: task_id },
        volunteer: { id: In(volunteer_ids) },
      },
    });

    if (!assignments.length) {
      throw new NotFoundException('No volunteer assignments found to remove');
    }

    await this.vtRepo.remove(assignments);
  }

  async updateAssignedVolunteers(
    task_id: number,
    volunteer_id: number,
    data: { start?: string; end?: string; status?: VolunteerTaskStatus },
  ): Promise<VolunteerTask> {
    const task = await this.findOne(task_id);
    if (!task) throw new NotFoundException(`Task ${task_id} not found`);

    const assignment = await this.vtRepo.findOne({
      where: { task: { id: task_id }, volunteer: { id: volunteer_id } },
    });

    if (!assignment) {
      throw new NotFoundException(
        `Volunteer ${volunteer_id} not assigned to task`,
      );
    }

    if (data.start) assignment.start = new Date(data.start);
    if (data.end) assignment.end = new Date(data.end);
    if (data.status) assignment.status = data.status;

    return this.vtRepo.save(assignment);
  }

  async updateAssignedVolunteersBulk(
    taskId: number,
    dto: {
      volunteer_ids: number[];
      start?: string;
      end?: string;
      status?: VolunteerTaskStatus;
    },
  ) {
    const { volunteer_ids, start, end, status } = dto;
    const assignments = await this.vtRepo.find({
      where: { task: { id: taskId }, volunteer: { id: In(volunteer_ids) } },
      relations: ['volunteer', 'task'],
    });

    if (!assignments.length) {
      throw new NotFoundException('No volunteer assignments found for update');
    }

    for (const assignment of assignments) {
      if (start) assignment.start = new Date(start);
      if (end) assignment.end = new Date(end);
      if (status) assignment.status = status;
    }

    return this.vtRepo.save(assignments);
  }

  async findVolunteersForTask(task_id: number): Promise<VolunteerTask[]> {
    const task = await this.findOne(task_id);
    return this.vtRepo.find({
      where: { task: { id: task.id } },
      relations: ['volunteer', 'task'],
    });
  }

  async getTasksForVolunteerInEvent(volunteerId: number, eventId: number) {
    if (!volunteerId || !eventId) throw new BadRequestException('Invalid IDs');

    // Check if volunteer exists
    const volunteer = await this.volunteerRepo.findOne({
      where: { id: volunteerId },
    });
    if (!volunteer) throw new NotFoundException('Volunteer not found');

    // Fetch tasks with volunteer_tasks for this volunteer only
    const tasks = await this.taskRepo
      .createQueryBuilder('task')
      .innerJoin(
        'task.volunteer_tasks',
        'vt',
        'vt.volunteerId = :volunteerId',
        {
          volunteerId,
        },
      )
      .leftJoinAndSelect('task.volunteer_tasks', 'vtSelect')
      .leftJoinAndSelect('vtSelect.volunteer', 'volunteer')
      .leftJoinAndSelect('volunteer.user', 'user')
      .where('task.eventId = :eventId', { eventId })
      .orderBy('task.start_date', 'ASC')
      .getMany();

    // Map tasks to flatten structure
    return tasks.map((task) => {
      const assignment = task.volunteer_tasks?.find(
        (vt) => vt.volunteer.id === volunteerId,
      );

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        location: task.location,
        start_date: task.start_date,
        end_date: task.end_date,
        status: task.status,
        volunteerStatus: assignment?.status || null,
        assigned_at: assignment?.assigned_at || null,
        volunteer: assignment
          ? {
              id: assignment.volunteer.id,
              date_of_birth: assignment.volunteer.date_of_birth,
              address: assignment.volunteer.address,
              emergency_contact: assignment.volunteer.emergency_contact,
              onboarding_status: assignment.volunteer.onboarding_status,
              user: {
                id: assignment.volunteer.user.id,
                name: assignment.volunteer.user.name,
                email: assignment.volunteer.user.email,
                phone: assignment.volunteer.user.phone,
                role: assignment.volunteer.user.role,
              },
            }
          : null,
      };
    });
  }
}

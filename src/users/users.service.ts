import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './enum/user.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findOneBy(createUserDto.email);

    if (existingUser) {
      throw new Error('Email already exists');
    }

    if (!createUserDto.password) {
      throw new BadRequestException('Password is required');
    }

    const hashedPassword = await this.hashPassword(createUserDto.password);

    const user = this.userRepo.create({
      name: createUserDto.name,
      email: createUserDto.email,
      passwordHash: hashedPassword,
      phone: createUserDto.phone,
      role: createUserDto.role || UserRole.VOLUNTEER,
    });

    return await this.userRepo.save(user);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    role?: UserRole,
    search?: string,
  ): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<User> = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const [users, total] = await this.userRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      select: [
        'id',
        'name',
        'email',
        'phone',
        'role',
        'createdAt',
        'updatedAt',
      ],
    });

    return {
      users,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      select: [
        'id',
        'name',
        'email',
        'phone',
        'role',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findOneById(id: number): Promise<User | null> {
    return await this.userRepo.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'phone', 'role', 'passwordHash'],
    });
  }

  async findOneBy(email: string): Promise<User | null> {
    return await this.userRepo.findOne({
      where: { email },
    });
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return await this.userRepo.find({
      where: { role },
      select: [
        'id',
        'name',
        'email',
        'phone',
        'role',
        'createdAt',
        'updatedAt',
      ],
      order: { name: 'ASC' },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findOneBy(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }

    Object.assign(user, updateUserDto);

    return await this.userRepo.save(user);
  }

  async updatePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const isPasswordValid = await this.comparePassword(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.passwordHash = await this.hashPassword(newPassword);
    await this.userRepo.save(user);
  }

  async updateRole(id: number, role: UserRole): Promise<User> {
    const user = await this.findOne(id);
    user.role = role;
    return await this.userRepo.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepo.remove(user);
  }

  async softDelete(id: number): Promise<void> {
    const result = await this.userRepo.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async count(): Promise<number> {
    return await this.userRepo.count();
  }

  async countByRole(role: UserRole): Promise<number> {
    return await this.userRepo.count({ where: { role } });
  }

  async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.findOneBy(email);
    return !!user;
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  private async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

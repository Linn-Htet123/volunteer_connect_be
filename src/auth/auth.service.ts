import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/users/enum/user.enum';
import { VolunteersService } from 'src/volunteers/volunteers.service';
import { Volunteer } from 'src/volunteers/entities/volunteer.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private volunteersService: VolunteersService,
  ) {}
  async logIn(loginDto: LoginDto) {
    const { email, password: pass } = loginDto;
    const user = await this.usersService.findOneBy(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      phone: user.phone,
      username: user.name,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(payload: CreateUserDto): Promise<User> {
    try {
      const user = await this.usersService.create(payload);
      return user;
    } catch (error: any) {
      throw new BadRequestException(
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Registration failed',
      );
    }
  }

  async me(userId: number) {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    let volunteer: Volunteer | null = null;
    console.log('User role:', user.role);
    if (user.role === UserRole.VOLUNTEER) {
      volunteer = await this.volunteersService.findByUserId(user.id);
      console.log('Volunteer profile:', volunteer);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      volunteer: volunteer || undefined,
    };
  }

  logout(userId: number) {
    // Option 1: Stateless (default JWT)
    // Just return message, no DB action needed
    // Client removes token from localStorage/cookies
    return { userId, message: 'User logged out successfully' };

    // Option 2: If you want to invalidate tokens later,
    // you can store blacklisted tokens or track refresh tokens in DB.
  }
}

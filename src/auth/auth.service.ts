import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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
      throw new ConflictException(
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Registration failed',
      );
    }
  }
}

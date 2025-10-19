/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UserRole } from 'src/users/enum/user.enum';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Public } from './public-strategy';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  getMe(@Req() req) {
    // req.user is populated by the AuthGuard .sub is user id
    return this.authService.me(req.user.sub);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  logIn(@Body() loginDto: LoginDto) {
    return this.authService.logIn(loginDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(@Body() registerDto: CreateUserDto) {
    const { name, email, password, phone } = registerDto;
    const payload = {
      name,
      email,
      password,
      phone,
      role: registerDto.role || UserRole.VOLUNTEER,
      createdAt: new Date(),
    };
    const user = await this.authService.register(payload);
    const token = await this.authService.logIn({
      email: payload.email,
      password: payload.password,
    });
    return { ...user, ...token };
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Req() req) {
    const userId = req.user.sub;
    await this.authService.logout(userId);
    return { message: 'Logout successful' };
  }
}

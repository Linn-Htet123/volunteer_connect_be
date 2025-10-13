import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UserRole } from 'src/users/enum/user.enum';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Public } from './public-strategy';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  logIn(@Body() loginDto: LoginDto) {
    return this.authService.logIn(loginDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  register(@Body() registerDto: CreateUserDto) {
    const { name, email, password, phone } = registerDto;
    const payload = {
      name,
      email,
      password,
      phone,
      role: registerDto.role || UserRole.VOLUNTEER,
      createdAt: new Date(),
    };
    return this.authService.register(payload);
  }
}

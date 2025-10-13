import {
  IsEmail,
  IsEnum,
  MinLength,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { UserRole } from 'src/users/enum/user.enum';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsPhoneNumber()
  phone: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

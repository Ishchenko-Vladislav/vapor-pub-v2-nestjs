import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @MinLength(5, {
    message: 'Пароль должен быть больше 5 символов',
  })
  @MaxLength(30, {
    message: 'Пароль должен быть меньше 30 символов',
  })
  password: string;
}

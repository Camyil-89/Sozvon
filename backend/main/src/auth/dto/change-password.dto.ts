import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsPhoneNumber, IsNotEmpty, Length, Matches } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({ example: 'StrongP@ssw0rd', description: 'Пароль пользователя', minLength: 6 })
    @IsNotEmpty({ message: 'Пароль не должен быть пустым' })
    @IsString({ message: 'Пароль должен быть строкой' })
    @Length(6, 64, { message: 'Пароль должен быть от 6 до 64 символов' })
    password: string;
}
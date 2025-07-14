import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsPhoneNumber, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'user@example.com', description: 'Email пользователя' })
    @IsNotEmpty({ message: 'Email не должен быть пустым' })
    @IsEmail({}, { message: 'Некорректный формат email' })
    email: string;

    @ApiProperty({ example: 'StrongP@ssw0rd', description: 'Пароль пользователя', minLength: 6 })
    @IsNotEmpty({ message: 'Пароль не должен быть пустым' })
    @IsString({ message: 'Пароль должен быть строкой' })
    @Length(6, 128, { message: 'Пароль должен быть от 6 до 128 символов' })
    password: string;
}
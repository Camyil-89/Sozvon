import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'user@example.com', description: 'Email пользователя' })
    @IsEmail({}, { message: 'Некорректный формат email' })
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'StrongP@ssw0rd', description: 'Password пользователя' })
    @IsString()
    @IsNotEmpty()
    password: string;
}

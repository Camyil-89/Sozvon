import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, Length } from 'class-validator';

export class UpdateProfileDTO {
    @ApiProperty({ example: 'john_doe', description: 'Имя пользователя', minLength: 2, maxLength: 255 })
    @IsNotEmpty({ message: 'Имя не должно быть пустым' })
    @IsString({ message: 'Имя должно быть строкой' })
    @Length(2, 255, { message: 'Имя должно быть от 2 до 255 символов' })
    name: string;

    @ApiProperty({ example: 'https://example.com/avatar.jpg ', description: 'Ссылка на изображение профиля', required: false })
    @IsOptional()
    @IsString({ message: 'URL изображения должен быть строкой' })
    @Length(0, 128, { message: 'imageProfile должно быть от 2 до 128 символов' })
    imageProfile?: string;
}
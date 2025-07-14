import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsEmail, IsPhoneNumber, IsNotEmpty, Length, Matches, IsNumber, IsInt, Min, Max, IsOptional } from 'class-validator';

export class allUsersQueryDto {
    @ApiProperty({ example: '0', description: 'от 0 до бесконечности' })
    @IsNotEmpty({ message: 'skip не должен быть пустым' })
    @IsInt({ message: 'Некорректный формат числа' })
    @Min(0)
    @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
    skip: number;

    @ApiProperty({ example: '100', description: 'от 1 до 100' })
    @IsNotEmpty({ message: 'limit не должен быть пустым' })
    @IsInt({ message: 'Некорректный формат числа' })
    @Min(1)
    @Max(100)
    @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
    limit: number;

    @ApiProperty({ example: 'user@example.com', description: 'email', required: false })
    @IsString()
    @IsOptional()
    @Transform(({ value }) => value?.trim())
    query?: string;
}
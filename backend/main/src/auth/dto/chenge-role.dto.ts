import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsEmail, IsPhoneNumber, IsNotEmpty, Length, Matches, IsNumber, IsInt, Min, Max, isArray, ArrayMinSize, IsArray, IsEnum } from 'class-validator';
import { UserRole } from 'src/auth/schemas/roles.enum';


export class ChangeRoleDto {
    @ApiProperty({
        example: ['ADMIN', 'USER'],
        description: 'Массив ролей для фильтрации',
        enum: UserRole,
        isArray: true,
    })
    @IsNotEmpty({ message: 'roles не должен быть пустым' })
    @IsArray({ message: 'roles должен быть массивом' })
    @ArrayMinSize(1, { message: 'roles должен содержать хотя бы одну роль' })
    @IsEnum(UserRole, { each: true, message: 'Некорректная роль' })
    @Transform(({ value }) => (Array.isArray(value) ? value : [value]), {
        toClassOnly: true,
    })
    roles: UserRole;
}
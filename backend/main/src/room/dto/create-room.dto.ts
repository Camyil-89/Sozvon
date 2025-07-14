import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateRoomDto {
    @ApiProperty({ example: 'room', description: 'название комнаты' })
    @IsNotEmpty({ message: 'name не должен быть пустым' })
    name: string;
}

import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class JoinRoomDto {
    @ApiProperty({ example: 'room', description: 'название комнаты' })
    @IsNotEmpty({ message: 'roomName не должен быть пустым' })
    roomName: string;
}
import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsNotEmpty, isString, IsString, Length, ValidateIf } from "class-validator";

export enum TypeRoom {
    Publish = "publish",
    Private = "private"
}

export enum StatusRoom {
    Temprorary = "temporary",
    Constant = "constant",
}


export class CreateRoomDto {
    @ApiProperty({ example: 'room', description: 'название комнаты', required: true })
    @IsNotEmpty({ message: 'name не должен быть пустым' })
    name: string;

    @ApiProperty({ example: 'temporary', description: 'тип комнаты', required: true })
    @IsNotEmpty({ message: 'type не должен быть пустым' })
    type: StatusRoom = StatusRoom.Temprorary;

    @ApiProperty({ example: 'publish', description: 'тип комнаты', required: true })
    @IsNotEmpty({ message: 'TypeRoom не должен быть пустым' })
    typeRoom: TypeRoom = TypeRoom.Publish;


    @ApiProperty({ example: ["UID_103653804660"], description: 'UID пользователей которые могут заходить при typeRoom = private', required: false })
    @ValidateIf((o) => o.typeRoom === TypeRoom.Private)
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    @Length(6, 16, { each: true })
    acceptUsers: [string];
}

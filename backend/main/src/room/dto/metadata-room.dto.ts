import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsNotEmpty, isString, IsString, Length, ValidateIf } from "class-validator";
import { StatusRoom, TypeRoom } from "./create-room.dto";

export class metadataRoom {
    name: string;

    type: StatusRoom = StatusRoom.Temprorary;

    typeRoom: TypeRoom = TypeRoom.Publish;

    acceptUsers: [string];

    userAdmin: {
        UID: string
    }
}

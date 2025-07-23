import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { Room } from 'livekit-server-sdk';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomSchema } from './schemas/room.schemas';
import { CallsModule } from 'src/gateway/calls/calls.module';

@Module({
    imports: [AuthModule,
        MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }], 'roomDB'),
        CallsModule
    ],
    controllers: [RoomController],
    providers: [RoomService]
})
export class RoomModule { }

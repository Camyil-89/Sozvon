// calls.module.ts
import { Module } from '@nestjs/common';
import { CallsGateway } from './calls.gateway';
import { CallsService } from './calls.service';
import { AuthModule } from 'src/auth/auth.module';
import { RedisModule } from 'src/redis/redis.module';
import { RoomModule } from 'src/room/room.module';
//import { Call, CallSchema } from './schemas/call.schemas';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [AuthModule, RedisModule,
        //MongooseModule.forFeature([{ name: Call.name, schema: CallSchema }], 'callsDB'),
    ],
    providers: [CallsService, CallsGateway],
    exports: [CallsService], // если другие модули будут использовать сервис
})
export class CallsModule { }
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.contreller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { AuthDatabaseModule } from './database/auth-database.module';
import { RoomModule } from './room/room.module';
import { RoomDatabaseModule } from './database/room-database.module';
import { FriendsModule } from './friends/friends.module';
import { CallsGateway } from './gateway/calls/calls.gateway';
import { CallsService } from './gateway/calls/calls.service';
import { CallsModule } from './gateway/calls/calls.module';
import { RedisModule } from './redis/redis.module';
import { CallsDatabaseModule } from './database/calls-database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true, // Делает ConfigModule глобальным
  }), AuthModule, AuthDatabaseModule, RoomModule, RoomDatabaseModule, FriendsModule, CallsModule, CallsDatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

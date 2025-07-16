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

@Module({
  imports: [AuthModule, AuthDatabaseModule, RoomModule, RoomDatabaseModule, FriendsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

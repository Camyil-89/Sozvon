import { Module } from '@nestjs/common';
import { AuthController } from './auth.contreller';
import { AuthService } from './auth.service';
import { Profile, User, UserSchema } from './schemas/user.schemas';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [

    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }], 'authDB'),
  ],
  controllers: [AuthController, ProfileController],
  providers: [AuthService, ProfileService],
  exports: [AuthService]
})
export class AuthModule { }


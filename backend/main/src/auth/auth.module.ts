import { Module } from '@nestjs/common';
import { AuthController } from './auth.contreller';
import { AuthService } from './auth.service';
import { User, UserSchema } from './schemas/user.schemas';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [

    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }], 'authDB'),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule { }


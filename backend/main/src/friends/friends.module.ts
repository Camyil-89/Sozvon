import { Module } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { Room } from 'livekit-server-sdk';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/schemas/user.schemas';
import { FriendsCotroller } from './friends.control';
import { FriendsService } from './friends.service';

@Module({
    imports: [AuthModule,
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }], 'authDB'),
    ],
    controllers: [FriendsCotroller],
    providers: [FriendsService],
})
export class FriendsModule { }

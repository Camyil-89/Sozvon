import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/schemas/user.schemas';
@Injectable()
export class FriendsService {
    constructor(@InjectModel(User.name, 'authDB') private authModel: Model<User>,) {
    }

    async getFriends(user) {

        return await this.authModel.find(
            { UID: { $in: user.profile.friends } },
            { email: 0, roles: 0, updatedAt: 0, createdAt: 0 } // исключаем эти поля
        ).exec();
    }


    async getAllUsers(user) {
        return await this.authModel.find(
            { UID: { $ne: user.UID } }, // Исключаем текущего пользователя
            { email: 0, roles: 0, updatedAt: 0, createdAt: 0 }
        ).exec();
    }

    async addFriend(user, uid) {
        const friend = await this.authModel.findOne({ UID: uid }).exec();
        if (!friend)
            throw new UnauthorizedException("Friend not found");

        if (uid === user.UID)
            throw new UnauthorizedException("self friend")

        if (!user.profile.friends.includes(uid)) {
            user.profile.friends.push(uid);
            await user.save();
        }

        return user;
    }


    async deleteFriend(user, uid) {
        user.profile.friends.remove(uid);
        await user.save();

        return user;
    }
}

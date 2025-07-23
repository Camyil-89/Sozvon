import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schemas';
import { Model } from 'mongoose';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Response, Request } from 'express';
import { ChangePasswordDto } from './dto/change-password.dto';
import { allUsersQueryDto } from './dto/allusers.dto';
import { ChangeRoleDto } from './dto/chenge-role.dto';
import { UpdateProfileDTO } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
    constructor(
        @InjectModel(User.name, 'authDB') private userModel: Model<User>,
    ) { }

    async updateProfile(dto: UpdateProfileDTO, user) {
        dto.name = dto.name.trim();
        if (dto.name.trim().length == 0)
            throw new UnauthorizedException("User name is null");
        const profile = await this.userModel.findOneAndUpdate(
            { email: user.email },
            { $set: { profile: dto } },
            { new: true, runValidators: true }
        ).exec();
        return profile;
    }


    async getUserByUID(uid: string) {
        console.log(uid);
        const user = await this.userModel.findOne({ UID: uid }).select(["profile", "UID"]).exec();
        console.log(user);
        return user;
    }
}

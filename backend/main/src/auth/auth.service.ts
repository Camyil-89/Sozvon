import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schemas';
import { Model } from 'mongoose';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import * as cookie from 'cookie';
import * as jwt from 'jsonwebtoken';
import { Response, Request } from 'express';
import { ChangePasswordDto } from './dto/change-password.dto';
import { allUsersQueryDto } from './dto/allusers.dto';
import { Server, Socket } from 'socket.io';
import { ChangeRoleDto } from './dto/chenge-role.dto';

@Injectable()
export class AuthService implements OnModuleInit {
    constructor(
        @InjectModel(User.name, 'authDB') private userModel: Model<User>,
    ) { }
    async onModuleInit() {
        await this.createAdminIfNotExists();
    }

    async createAdminIfNotExists() {
        try {
            const admin = await this.userModel.findOne({ email: 'admin@admin.com' });
            if (!admin) {
                const hash = await bcrypt.hash('admin', 5);
                await this.userModel.create({ email: 'admin@admin.com', password: hash, roles: ['admin'] });
            }
        } catch (error) {
            console.error(
                'Ошибка при создании администратора',
                error,
            );
        }
    }
    async createUser(dto: CreateUserDto) {
        if (await this.userModel.findOne({ email: dto.email })) {
            throw new UnauthorizedException("User already exists");
        }
        const hash = await bcrypt.hash(dto.password, 5);
        const user = await this.userModel.create({ ...dto, password: hash });
        return { email: user.email };
    }

    async login(dto: LoginDto) {
        const foundUser = await this.userModel.findOne({ email: dto.email });
        if (!foundUser) {
            throw new UnauthorizedException("User not found");
        }
        if (!(await bcrypt.compare(dto.password, foundUser.password))) {
            throw new UnauthorizedException("Invalid password");
        }
        const token = jwt.sign({ sub: foundUser._id, email: foundUser.email, roles: foundUser.roles }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        return { token, user: foundUser };
    }

    async getMe(req: Request) {
        const token = req.cookies?.['jwt'];
        return await this._getMe(token);
    }

    async getMeWS(client: Socket) {
        const cookies = cookie.parse(client.client.request.headers.cookie);
        return await this._getMe(cookies?.jwt);
    }

    async _getMe(token) {
        if (!token) throw new UnauthorizedException("Token expires");
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
        const user = await this.userModel.findById(payload.sub);
        if (!user) throw new UnauthorizedException("User not found");
        return user;
    }



    async changePassword(dto: ChangePasswordDto, req: Request) {
        const user = await this.getMe(req);
        const user_full: any = await this.userModel.find({ email: user.email });
        if (!user_full) {
            throw new UnauthorizedException(
                "User not found",
            );
        }
        const hash = await bcrypt.hash(dto.password, 5);
        await this.userModel.findByIdAndUpdate(user_full, { password: hash });
        return { message: 'Пароль успешно изменен' };
    }

    async getAllUsers(dto: allUsersQueryDto) {
        const { skip, limit, query } = dto;

        const filter: any = {};

        if (query) {
            filter.email = { $regex: query, $options: 'i' }; // case-insensitive поиск
        }
        const clone_query = this.userModel.find(filter)
            .skip(skip)
            .limit(limit).clone();

        return {
            users: await this.userModel.find(filter)
                .skip(skip)
                .limit(limit)
                .exec(), count: await clone_query.countDocuments()
        };
    }

    async getUserByEmail(email: string) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedException("User not found");
        }
        return user;
    }

    async deleteUserByEmail(email: string) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedException("User not found");
        }
        await this.userModel.deleteOne({ email });
        return { message: 'Пользователь успешно удален' };
    }

    async changeUserRole(dto: ChangeRoleDto, email: string) {
        const user = await this.userModel.findOne({ email: email });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        const updatedUser = await this.userModel.findByIdAndUpdate(user._id, { $set: { roles: dto.roles } }, { new: true });
        if (!updatedUser) throw new UnauthorizedException();
        return updatedUser;
    }
}

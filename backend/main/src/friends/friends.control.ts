import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { Response, Request } from 'express';
import { FriendsService } from './friends.service';

@Controller("friends")
export class FriendsCotroller {
    constructor(private readonly friendsService: FriendsService,
        private readonly authService: AuthService
    ) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getFriends(@Req() req: Request) {
        const user = await this.authService.getMe(req);
        return await this.friendsService.getFriends(user);
    }

    @Post("/:id")
    @UseGuards(JwtAuthGuard)
    async addFriends(@Req() req: Request, @Param("id") id: string) {
        const user = await this.authService.getMe(req);
        return await this.friendsService.addFriend(user, id);
    }

    @Delete("/:id")
    @UseGuards(JwtAuthGuard)
    async deleteFriends(@Req() req: Request, @Param("id") id: string) {
        const user = await this.authService.getMe(req);
        return await this.friendsService.deleteFriend(user, id);
    }

    @Get("all")
    @UseGuards(JwtAuthGuard)
    async getAllUsers(@Req() req: Request) {
        const user = await this.authService.getMe(req);
        return await this.friendsService.getAllUsers(user);
    }

}

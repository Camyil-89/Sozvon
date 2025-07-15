import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { allUsersQueryDto } from './dto/allusers.dto';
import { Roles } from './guard/roles.decorator';
import { UserRole } from './schemas/roles.enum';
import { RolesGuard } from './guard/roles.guard';
import { ChangeRoleDto } from './dto/chenge-role.dto';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@Controller("profile")
export class ProfileController {
    constructor(private readonly profileService: ProfileService,
        private readonly authService: AuthService
    ) { }
    @Put()
    async updateProfile(@Body() dto: UpdateProfileDTO, @Req() req: Request) {
        const user = await this.authService.getMe(req);
        return { profile: await this.profileService.updateProfile(dto, user) };
    }
}

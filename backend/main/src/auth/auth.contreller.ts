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

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("")
  async register(@Body() dto: CreateUserDto) {
    return this.authService.createUser(dto);
  }

  @Get("/logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt');
    return { message: 'Logout successful' };
  }

  @Post("/login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { token, user } = await this.authService.login(dto);
    res.cookie('jwt', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 3600000 * 24 * 3 });
    return user;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: Request) {
    return this.authService.getMe(req);
  }


  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  async changePassword(@Body() dto: ChangePasswordDto, @Res() res: Response, @Req() req: Request) {
    const status = await this.authService.changePassword(dto, req);
    return res.status(201).send(status);;
  }

  @Get("/admin/users")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUsers(@Query() dto: allUsersQueryDto) {
    return await this.authService.getAllUsers(dto);
  }

  @Get("admin/users/:email")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUser(@Param("email") id: string) {
    return await this.authService.getUserByEmail(id);
  }

  @Delete("admin/users/:email")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteUser(@Param("email") id: string) {
    return await this.authService.deleteUserByEmail(id);
  }


  @Put("admin/users/role/:email")
  async updateUserRole(@Param("email") id: string, @Body() dto: ChangeRoleDto) {
    return await this.authService.changeUserRole(dto, id);
  }
}

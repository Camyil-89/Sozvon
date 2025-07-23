import { Body, Controller, Delete, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { Response, Request } from 'express';
import { Headers, BadRequestException, UnauthorizedException, RawBodyRequest } from '@nestjs/common';
@Controller("rooms")
export class RoomController {
    constructor(private readonly roomService: RoomService,
        private readonly authService: AuthService
    ) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getRooms() {
        return await this.roomService.listRooms();
    }

    @Get("/livekit")
    @UseGuards(JwtAuthGuard)
    async getRoomsLiveKit() {
        return await this.roomService.listRoomsLiveKit();
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async createRoom(@Body() dto: CreateRoomDto, @Req() req: Request) {
        const user = await this.authService.getMe(req);
        return await this.roomService.createRoom(dto.name, user);
    }

    @Post("/call")
    @UseGuards(JwtAuthGuard)
    async callRoom(@Body() dto: CreateRoomDto, @Req() req: Request) {
        const user = await this.authService.getMe(req);
        return await this.roomService.callRoom(dto, user);
    }


    @Delete("/:id")
    @UseGuards(JwtAuthGuard)
    async deleteRoom(@Param("id") id: string) {
        return await this.roomService.deleteRoom(id);
    }

    @Get("/:roomName")
    @UseGuards(JwtAuthGuard)
    async joinRoom(@Param("roomName") id: string, @Req() req: Request) {
        const user = await this.authService.getMe(req);
        return await this.roomService.generateToken(id, user.UID, user.profile.name);
    }
    @Get("/:roomName/leave")
    @UseGuards(JwtAuthGuard)
    async leaveRoom(@Param("roomName") id: string, @Req() req: Request) {
        const user = await this.authService.getMe(req);
        return await this.roomService.leaveRoom(id, user.UID);
    }


    @Get("/:roomName/participants")
    @UseGuards(JwtAuthGuard)
    async getParticipants(@Param("roomName") roomName: string) {
        return await this.roomService.listParticipants(roomName);
    }

    @Get("/:roomName/add/:userId")
    @UseGuards(JwtAuthGuard)
    async addUserToRoom(@Param("roomName") roomName: string, @Param("userId") userId: string, @Req() req: Request) {
        const user = await this.authService.getMe(req);
        return await this.roomService.addUserToRoom(roomName, userId, user.UID)
    }

    @Post('/livekit/webhook')
    async webhook(@Req() req: Request, @Headers('Authorization') authHeader: string) {
        // Предполагается, что RoomService инжектится через конструктор
        // constructor(private readonly roomService: RoomService) {}

        // Передаем req и authHeader в сервис
        return this.roomService.webhook(req, authHeader);
    }
}

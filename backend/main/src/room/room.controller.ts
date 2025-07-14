import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { Response, Request } from 'express';

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

    @Post()
    @UseGuards(JwtAuthGuard)
    async createRoom(@Body() dto: CreateRoomDto) {
        await this.roomService.createRoom(dto.name);
        return {
            message: 'Room created successfully',
            roomName: dto.name
        };
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
        return await this.roomService.generateToken(id, user.email, user.email);
    }


    @Get("/:roomName/participants")
    @UseGuards(JwtAuthGuard)
    async getParticipants(@Param("roomName") roomName: string) {
        return await this.roomService.listParticipants(roomName);
    }
}

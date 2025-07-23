import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { time } from 'console';
import { AccessToken, Room, RoomServiceClient } from 'livekit-server-sdk';
import { Model } from 'mongoose';
import { json } from 'stream/consumers';
import { CreateRoomDto } from './dto/create-room.dto';
import { CallsService } from 'src/gateway/calls/calls.service';
const crypto = require('crypto');
@Injectable()
export class RoomService {
    private roomProvider: RoomServiceClient;

    private apiKey: string = "8f67bc68b4404bb425cfe45730f41bb7";
    private apiSecret: string = "5150a1728eab011c70822e4655da907a";

    constructor(@InjectModel(Room.name, 'roomDB') private roomModel: Model<Room>,
        private readonly callsService: CallsService,) {
        this.roomProvider = new RoomServiceClient(
            "http://192.168.56.1:7880", //configService.get('LIVEKIT_HOST'),
            this.apiKey,
            this.apiSecret
        );

        callsService.setRoomService(this);
    }

    generateUniqueString(length = 64) {
        return (Date.now() + crypto.randomBytes(length).toString('hex')).slice(0, length);
    }

    async createRoom(name: string, user) {
        const uid = this.generateUniqueString();
        const room = await this.roomModel.create({ name: name, usersAdmin: [user.UID], UID: uid })
        return room;
    }

    async callRoom(dto: CreateRoomDto, user) {
        const uid = this.generateUniqueString();
        if (!dto.acceptUsers.includes(user.UID)) {
            dto.acceptUsers.push(user.UID);
        }
        await this.createRoomCallLiveKit(uid, dto);
        dto.acceptUsers.forEach(au => {
            if (au === user.UID) {
                return;
            }
            this.callsService.sendCallUser(au, user.UID, uid);
        })
        return { UID: uid };
    }

    async createRoomCallLiveKit(uid, data: any = null) {
        let metadata = data != null ? JSON.stringify(data) : '';
        await this.roomProvider.createRoom({
            name: uid,
            emptyTimeout: 300, // 1 hour
            metadata: metadata
        });
    }

    async createRoomLiveKit(room) {
        try {
            await this.roomProvider.createRoom({
                name: room.UID,
                emptyTimeout: 0, // 1 hour
                maxParticipants: room.maxUsers,
            });
        } catch { }
    }

    async findRoomByUID(uid: string) {
        const room = (await this.listRoomsLiveKit()).find((room) => room.name == uid);
        if (!room)
            throw new UnauthorizedException("Not found room");
        const metadata = room?.metadata ? JSON.parse(room.metadata) : undefined;
        if (!metadata)
            throw new UnauthorizedException("Not correct metadata room");
        return { room: room, metadata: metadata };
    }

    async listRoomsLiveKit() {
        return await this.roomProvider.listRooms();
    }


    async listRooms() {
        return await this.roomModel.find({}).exec()
    }
    async deleteRoom(roomName: string) {
        await this.roomProvider.deleteRoom(roomName);
        return { "message": "Room deleted successfully" }
    }

    async generateToken(roomUID: string, userId: string, username: string) {
        const room = await this.findRoomByUID(roomUID);
        if (room == null)
            throw new UnauthorizedException("Room not found");

        if (room.metadata.acceptUsers.includes(userId) == false)
            throw new UnauthorizedException("User not permited in room");

        const at = new AccessToken(
            this.apiKey,
            this.apiSecret,
            {
                identity: userId,
                name: username,
            },
        );

        at.addGrant({
            roomJoin: true,
            room: roomUID,
            canPublish: true,
            canSubscribe: true,
        });

        return await at.toJwt();
    }


    async listParticipants(roomName: string): Promise<any> {
        return await this.roomProvider.listParticipants(roomName);
    }


    async leaveRoom(roomName: string, userId: string) {
        await this.callsService.leaveRoom(userId);
    }

}

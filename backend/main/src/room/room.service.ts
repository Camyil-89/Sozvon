import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { time } from 'console';
import { AccessToken, Room, RoomServiceClient } from 'livekit-server-sdk';
import { Model } from 'mongoose';
const crypto = require('crypto');
@Injectable()
export class RoomService {
    private roomProvider: RoomServiceClient;

    private apiKey: string = "8f67bc68b4404bb425cfe45730f41bb7";
    private apiSecret: string = "5150a1728eab011c70822e4655da907a";

    constructor(@InjectModel(Room.name, 'roomDB') private roomModel: Model<Room>,) {
        this.roomProvider = new RoomServiceClient(
            "http://192.168.56.1:7880", //configService.get('LIVEKIT_HOST'),
            this.apiKey,
            this.apiSecret
        );
    }

    generateUniqueString(length = 64) {
        return (Date.now() + crypto.randomBytes(length).toString('hex')).slice(0, length);
    }

    async createRoom(name: string, user) {
        const uid = this.generateUniqueString();
        const room = await this.roomModel.create({ name: name, usersAdmin: [user.UID], UID: uid })
        return room;
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

    async generateToken(roomName: string, userId: string, username: string) {
        const room: any = await this.roomModel.findOne({ UID: roomName }).exec()
        await this.createRoomLiveKit(room);
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
            room: roomName,
            canPublish: true,
            canSubscribe: true,
        });

        return await at.toJwt();
    }


    async listParticipants(roomName: string): Promise<any> {
        return await this.roomProvider.listParticipants(roomName);
    }


}

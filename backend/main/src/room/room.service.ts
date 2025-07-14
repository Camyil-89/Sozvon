import { Injectable } from '@nestjs/common';
import { AccessToken, Room, RoomServiceClient } from 'livekit-server-sdk';

@Injectable()
export class RoomService {
    private roomProvider: RoomServiceClient;

    private apiKey: string = "8f67bc68b4404bb425cfe45730f41bb7";
    private apiSecret: string = "5150a1728eab011c70822e4655da907a";

    constructor() {
        this.roomProvider = new RoomServiceClient(
            "http://192.168.56.1:7880", //configService.get('LIVEKIT_HOST'),
            this.apiKey,
            this.apiSecret
        );
    }

    async createRoom(name: string): Promise<void> {
        await this.roomProvider.createRoom({
            name,
            emptyTimeout: 60 * 60, // 1 hour
            maxParticipants: 20,
        });
    }


    async listRooms(): Promise<Room[]> {
        return await this.roomProvider.listRooms();
    }
    async deleteRoom(roomName: string) {
        await this.roomProvider.deleteRoom(roomName);
        return { "message": "Room deleted successfully" }
    }

    async generateToken(roomName: string, userId: string, username: string) {
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

    async mute() {
    }
}

import { Injectable, RawBodyRequest, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { time } from 'console';
import { AccessToken, Room, RoomServiceClient, WebhookReceiver } from 'livekit-server-sdk';
import { Model } from 'mongoose';
import { json } from 'stream/consumers';
import { CreateRoomDto } from './dto/create-room.dto';
import { CallsService } from 'src/gateway/calls/calls.service';
import { Response, Request } from 'express';
import { metadataRoom } from './dto/metadata-room.dto';
const crypto = require('crypto');


@Injectable()
export class RoomService {
    private roomProvider: RoomServiceClient;

    private apiKey: string = "8f67bc68b4404bb425cfe45730f41bb7";
    private apiSecret: string = "5150a1728eab011c70822e4655da907a";
    private receiver; WebhookReceiver;
    constructor(@InjectModel(Room.name, 'roomDB') private roomModel: Model<Room>,
        private readonly callsService: CallsService,) {
        this.roomProvider = new RoomServiceClient(
            "http://192.168.56.1:7880", //configService.get('LIVEKIT_HOST'),
            this.apiKey,
            this.apiSecret
        );
        this.receiver = new WebhookReceiver(this.apiKey, this.apiSecret);
        callsService.setRoomService(this);
    }

    generateUniqueString(length = 64) {
        return (Date.now() + crypto.randomBytes(length).toString('hex')).slice(0, length);
    }

    async webhook(req: Request, authHeader: string) { // Принимаем req и authHeader
        // Получаем тело запроса как строку
        const body = (req as any).rawBody || JSON.stringify(req.body);
        if (!body) {
            return;
        }
        const event = await this.receiver.receive(body, authHeader);

        if (event.event == "participant_joined") {
            const metadata = JSON.parse(event.room.metadata) as metadataRoom;
            this.callsService.joinRoom(event.participant.identity, metadata.userAdmin.UID)
        }
        else if (event.event == "participant_left") {
        }

    }


    async createRoom(name: string, user) {
        const uid = this.generateUniqueString();
        const room = await this.roomModel.create({ name: name, usersAdmin: [user.UID], UID: uid })
        return room;
    }

    async getMetadataRoomName(name: string) {
        const room = (await this.listRoomsLiveKit()).find(r => r.name == name);

        if (!room)
            return null;

        const metadata = JSON.parse(room.metadata) as metadataRoom;
        return metadata;
    }

    async setMetadataRoomName(name: string, data: any) {
        return await this.roomProvider.updateRoomMetadata(name, JSON.stringify(data));
    }


    async callRoom(dto: CreateRoomDto, user) {
        const uid = this.generateUniqueString();
        if (!dto.acceptUsers.includes(user.UID)) {
            dto.acceptUsers.push(user.UID);
        }
        await this.createRoomCallLiveKit(uid, user.UID, dto);
        dto.acceptUsers.forEach(au => {
            if (au === user.UID) {
                return;
            }
            this.callsService.sendCallUser(au, user.UID, uid);
        })
        return { UID: uid };
    }

    async createRoomCallLiveKit(uid, admin_UID, data: any = null,) {
        const metadata_room = new metadataRoom();
        metadata_room.userAdmin = { UID: admin_UID }
        const combinedObj = {
            ...metadata_room,
            ...data  // если нужно добавить дополнительные поля из data
        };
        let metadata = data != null ? JSON.stringify(combinedObj) : '';
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

        //if (!(await this.callsService.inRoomUser(userId)))
        //    throw new UnauthorizedException("User not in room");

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
        //await this.callsService.leaveRoom(userId);
    }


    async addUserToRoom(roomName: string, userIdadd: string, userUID: string) {
        console.log(roomName, userIdadd, userUID)
        const metadata = await this.getMetadataRoomName(roomName);
        if (metadata == null)
            throw new UnauthorizedException("No found room");
        if (!metadata.acceptUsers.includes(userIdadd))
            metadata.acceptUsers.push(userIdadd);
        if (await this.setMetadataRoomName(roomName, metadata) == null)
            throw new UnauthorizedException("Not set metadata");
        this.callsService.sendCallUser(userIdadd, userUID, roomName);
        return metadata;
    }
}

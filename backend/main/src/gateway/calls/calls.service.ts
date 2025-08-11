// chat.service.ts
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { CallsGateway } from './calls.gateway';
import { RedisService } from 'src/redis/redis.service';
import { Call, statusCall, statusUserCall, } from './schemas/call.schemas';
import { RoomService } from 'src/room/room.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

export enum CallsStatus {
    userIsIncomingCall = 1,
    userInRoom = 2,
    CallOK = 3,
    ErrorReadBase = 4,
    UserOffline = 5,
}

export const statusMessages: Record<CallsStatus, string> = {
    [CallsStatus.userIsIncomingCall]: 'Пользователь получает входящий вызов',
    [CallsStatus.userInRoom]: 'Пользователь в комнате',
    [CallsStatus.CallOK]: 'Вызов успешен',
    [CallsStatus.ErrorReadBase]: 'Ошибка чтения базы данных',
    [CallsStatus.UserOffline]: 'Пользователь оффлайн',
};

@Injectable()
export class CallsService {
    constructor(
        //@InjectModel(Call.name, 'callsDB') private callModel: Model<Call>,
        private readonly redisSevice: RedisService
    ) {

    }
    private userSockets = new Map<string, string[]>(); // userid → soscketid
    private server: Server;
    private roomService: RoomService;
    private readonly TIMEOUT_CALL = 60000;


    getUserSockets() {
        return this.userSockets;
    }

    setRoomService(roomService: RoomService) {
        this.roomService = roomService;
    }
    setServer(server: Server) {
        this.server = server;
    }

    async setUserSocket(userId: string, socketId: string) {
        if (this.userSockets.has(userId)) {
            this.userSockets.get(userId)?.push(socketId);
        }
        else {
            this.userSockets.set(userId, [socketId]);
        }

        const userCall = await this.redisSevice.get(`call_${userId}`)
        if (!userCall) {
            await this.redisSevice.set(`call_${userId}`, Object.assign(new Call(), { userUID: userId, status: statusCall.nothing, online: { is: true, lastTime: new Date() } }))
        }
        else {
            userCall.online = { is: true, lastTime: new Date() };
            await this.redisSevice.set(`call_${userId}`, userCall)
        }
    }

    async removeUserSocket(userID: string, socketID: string) {
        let user: any = this.userSockets.get(userID);
        user = user?.filter(id => id !== socketID);
        if (user?.length == 0) {
            this.userSockets.delete(userID);
            await this.redisSevice.del(`call_${userID}`)
        }
        else {
            this.userSockets.set(userID, user);
        }
    }

    async sendCallUser(userId: string, from_uid, room_uid): Promise<CallsStatus> {

        const user_call = await this.redisSevice.get(`call_${userId}`);
        const user_from_call = await this.redisSevice.get(`call_${from_uid}`);
        if (!user_call)
            return CallsStatus.UserOffline;
        if (!user_call || !user_from_call) {
            return CallsStatus.ErrorReadBase;
        }

        if (user_call.status != statusCall.nothing) {
            return CallsStatus.userIsIncomingCall;
        }

        user_call.status = statusCall.incomingCall;
        user_call.incomingCall = {
            time: new Date(),
            userUID: from_uid
        }

        user_call.room = {
            isAdmin: false,
            roomUID: room_uid,
            users: null
        }

        user_from_call.status = statusCall.inRoom;
        if (user_from_call.room && user_from_call.room.users != null) {
            if (user_from_call.room.users?.find(u => u.UID == userId) == null) {
                user_from_call.room.users.push({
                    UID: userId,
                    status: statusUserCall.wait,
                    time: new Date()
                });
            }
        }
        else {
            user_from_call.room = {
                isAdmin: true,
                roomUID: room_uid,
                users: [{ UID: userId, status: statusUserCall.wait, time: new Date() }]
            }
        }

        await this.redisSevice.set(`call_${userId}`, user_call);
        await this.redisSevice.set(`call_${from_uid}`, user_from_call);

        this.sendWS(user_call.userUID, "call_state", await this.redisSevice.get(`call_${user_call.userUID}`));
        return CallsStatus.CallOK;
    }


    async inRoomUser(userId: string) {
        const call = await this.redisSevice.get(`call_${userId}`);
        return call?.status == statusCall.inRoom;
    }

    async updateState(userId: string) {
        const socketId = this.userSockets.get(userId);
        if (!socketId)
            return;

        let user = await this.redisSevice.get(`call_${userId}`);
        user = await this.updateCallStatus(user);
        if (!user) {
            return;
        }
        user.online.lastTime = new Date();
        await this.redisSevice.set(`call_${userId}`, user);

        for (let id of socketId) {
            this.server.to(id).emit("call_state", user);
        }
    }

    async sendState(usedId: string, socketId: string) {
        let user = await this.redisSevice.get(`call_${usedId}`);
        if (!user) {
            return;
        }
        user = await this.updateCallStatus(user);
        user.online.lastTime = new Date();
        await this.redisSevice.set(`call_${usedId}`, user);
        this.server.to(socketId).emit("call_state", user);
    }


    async callRejected(userId) {

        const call = await this.redisSevice.get(`call_${userId}`);
        if (!call || !call.incomingCall)
            return;
        let call_from = await this.redisSevice.get(`call_${call.incomingCall.userUID}`);
        if (!call_from || !call_from.room || !call_from.room.users)
            return

        call.status = statusCall.nothing;
        call.room = null;
        call.incomingCall = null;

        await this.redisSevice.set(`call_${userId}`, call);

        const u_call = call_from.room.users.find(u => u.UID == userId);
        if (!u_call)
            return;
        u_call.status = statusUserCall.reject;
        call_from = await this.updateCallStatus(call_from);
        if (!call_from)
            return;

        await this.redisSevice.set(`call_${call_from.userUID}`, call_from);
        this.sendWS(call_from.userUID, "call_state", await this.redisSevice.get(`call_${call_from.userUID}`));
    }


    sendWS(userId: string, method: string, data: any) {
        let sockets: any = this.userSockets.get(userId);
        if (!sockets)
            return;
        sockets.forEach(id => {
            this.server.to(id).emit(method, data);
        });
    }

    async joinRoom(userUID: string, userUIDAdmin: string) {
        if (userUID == userUIDAdmin)
            return;

        const call = await this.redisSevice.get(`call_${userUID}`);
        if (!call)
            return;

        call.status = statusCall.inRoom;
        await this.redisSevice.set(`call_${userUID}`, call);

        const call_from = await this.redisSevice.get(`call_${userUIDAdmin}`);

        if (!call_from || !call_from.room || !call_from?.room.users) {
            return;
        }
        const u_call = call_from.room.users.find(u => u.UID == userUID);
        if (!u_call)
            return;

        u_call.status = statusUserCall.accept;
        await this.redisSevice.set(`call_${userUIDAdmin}`, call_from);

        this.sendWS(userUIDAdmin, "call_state", await this.redisSevice.get(`call_${userUIDAdmin}`));
        this.sendWS(userUID, "call_state", await this.redisSevice.get(`call_${userUID}`));
        console.log(await this.redisSevice.get(`call_${userUID}`));
    }

    async leaveRoom(userUID: string, userUIDAdmin: string) {
        const call = await this.redisSevice.get(`call_${userUID}`);
        if (!call)
            return;

        call.status = statusCall.nothing;
        await this.redisSevice.set(`call_${userUID}`, call);

        if (userUID == userUIDAdmin)
            return;
        const call_from = await this.redisSevice.get(`call_${userUIDAdmin}`);

        if (!call_from || !call_from.room || !call_from?.room.users) {
            return;
        }

        const u_call = call_from.room.users.find(u => u.UID == userUID);
        if (!u_call)
            return;

        u_call.status = statusUserCall.leave;
        await this.redisSevice.set(`call_${userUIDAdmin}`, call_from);

        this.sendWS(userUIDAdmin, "call_state", await this.redisSevice.get(`call_${userUIDAdmin}`));
        this.sendWS(userUID, "call_state", await this.redisSevice.get(`call_${userUID}`));
    }

    async updateCallStatus(call: any) {
        if (call.status == statusCall.nothing) {
            call.room = null;
            call.incomingCall = null;
            return call;
        }

        if (call.status == statusCall.incomingCall && call.incomingCall) {
            if (new Date().getTime() - new Date(call.incomingCall.time).getTime() > this.TIMEOUT_CALL) {
                call.status = statusCall.nothing;
            }
            if (call.incomingCall) {
                const users = Array.from(await this.roomService.listParticipants(call.room.roomUID)).map((p: any) => p.identity);
                if (!users.includes(call.incomingCall.userUID)) {
                    call.status = statusCall.nothing;
                }
            }
        }
        if (call.status == statusCall.inRoom) {
            if (call.room && call.room.isAdmin) {
                const users = Array.from(await this.roomService.listParticipants(call.room.roomUID)).map((p: any) => p.identity);
                call.room.users.forEach(user => {
                    if (!users.includes(user.UID) && user.status == statusUserCall.accept) {
                        user.status = statusUserCall.leave
                    }
                    else if (new Date().getTime() - new Date(user.time).getTime() > this.TIMEOUT_CALL && user.status == statusUserCall.wait) {
                        user.status = statusUserCall.reject;
                    }
                });
                const wait_users = call.room.users.filter((u) => u.status == statusUserCall.accept || u.status == statusUserCall.wait);
                if (wait_users.length == 0) {
                    call.status = statusCall.nothing;
                }
            }
        }

        if (call.status == statusCall.nothing) {
            call.room = null;
            call.incomingCall = null;
        }

        return call;
    }

}
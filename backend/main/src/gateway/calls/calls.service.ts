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

@Injectable()
export class CallsService {
    constructor(
        @InjectModel(Call.name, 'callsDB') private callModel: Model<Call>
    ) {

    }
    private userSockets = new Map<string, string[]>(); // socketId → userId
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

        const userCall = await this.callModel.findOne({ userUID: userId }).exec();
        if (!userCall) {
            await this.callModel.create({ userUID: userId, status: statusCall.nothing, online: { is: true, lastTime: new Date() } });
        }
        else {
            userCall.online = { is: true, lastTime: new Date() };
            await userCall.save();
            await this.updateCallStatus(userCall);
        }
    }

    async removeUserSocket(userID: string, socketID: string) {
        let user: any = this.userSockets.get(userID);
        user = user?.filter(id => id !== socketID);
        if (user?.length == 0) {
            this.userSockets.delete(userID);
            const call = await this.callModel.findOne({ userUID: userID }).exec();
            if (!call)
                return;
            call.online.is = false;
            call.online.lastTime = new Date();
            call.save();
        }
        else {
            this.userSockets.set(userID, user);
        }
    }

    async sendCallUser(userId: string, from_uid, room_uid): Promise<CallsStatus> {
        const user_call = await this.callModel.findOne({ userUID: userId }).exec();
        const user_from_call = await this.callModel.findOne({ userUID: from_uid }).exec();

        if (!user_call || !user_from_call) {
            return CallsStatus.ErrorReadBase;
        }

        console.log("asdasd")
        if (new Date().getTime() - new Date(user_call.online.lastTime).getTime() > 15000) {
            return CallsStatus.UserOffline;
        }

        console.log("asdasd")
        if (user_call.status != statusCall.nothing) {
            return CallsStatus.userIsIncomingCall;
        }
        console.log("asdasd312")

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


        await user_call.save();
        await user_from_call.save();

        this.sendWS(user_call.userUID, "call_state", await this.callModel.findOne({ userUID: user_call.userUID }).exec());

        return CallsStatus.CallOK;
    }


    async inRoomUser(userId: string) {
        const call = await this.callModel.findOne({ userUID: userId }).exec();
        return call?.status == statusCall.inRoom;
    }

    async joinRoom(userId: string) {
        const call = await this.callModel.findOne({ userUID: userId }).exec();
        if (!call || !call.incomingCall)
            return;

        const call_from = await this.callModel.findOne({ userUID: call.incomingCall.userUID }).exec();

        if (!call_from || !call_from.room || !call_from?.room.users) {
            return;
        }
        const u_call = call_from.room.users.find(u => u.UID == userId);
        if (!u_call)
            return;

        u_call.status = statusUserCall.accept;

        call.status = statusCall.inRoom;
        call.save();
        call_from.save();
    }

    async leaveRoom(userId: string) {
        //await this.redisService.set(`call_${userId}`, Object.assign(new StatusCallRedis(), {
        //    userUID: userId,
        //    status: statusCall.nothing
        //}))
    }

    async sendState(usedId: string, socketId: string) {
        let user = await this.callModel.findOne({ userUID: usedId }).exec();
        user = await this.updateCallStatus(user);
        if (!user) {
            return;
        }
        user.online.lastTime = new Date();
        await user.save();
        this.server.to(socketId).emit("call_state", user);
    }


    async callRejected(userId) {
        console.log(userId);
        const call = await this.callModel.findOne({ userUID: userId }).exec();
        if (!call || !call.incomingCall)
            return;
        let call_from = await this.callModel.findOne({ userUID: call.incomingCall.userUID }).exec();
        if (!call_from || !call_from.room || !call_from.room.users)
            return

        call.status = statusCall.nothing;
        call.room = null;
        call.incomingCall = null;

        await call.save();

        const u_call = call_from.room.users.find(u => u.UID == userId);
        if (!u_call)
            return;
        u_call.status = statusUserCall.reject;
        call_from = await this.updateCallStatus(call_from);
        if (!call_from)
            return;

        await call_from.save();
        this.sendWS(call_from.userUID, "call_state", await this.callModel.findOne({ userUID: call_from.userUID }).exec());
    }


    sendWS(userId: string, method: string, data: any) {
        let sockets: any = this.userSockets.get(userId);
        if (!sockets)
            return;
        sockets.forEach(id => {
            this.server.to(id).emit(method, data);
        });
    }


    async updateCallStatus(call: any) {
        if (call.status == statusCall.incomingCall && call.incomingCall != null) {
            if (new Date().getTime() - new Date(call.incomingCall.time).getTime() > this.TIMEOUT_CALL) {
                call.status = statusCall.nothing;
                call.incomingCall = null;
                call.room = null
            }
            else {
                const call_from = await this.callModel.findOne({ userUID: call.incomingCall.userUID });
                if (!call_from || call_from.status != statusCall.inRoom || call_from.room?.roomUID != call.room.roomUID) {
                    call.status = statusCall.nothing;
                    call.incomingCall = null;
                    call.room = null;
                }
            }
        }

        else if (call.status == statusCall.inRoom && call.room && call.room.users) {
            // Проверяем, все ли пользователи отклонили вызов
            const rejectCount = call.room.users.filter(u => u.status == statusUserCall.reject || u.status == statusUserCall.leave).length;
            if (rejectCount > 0 && rejectCount == call.room.users.length) {
                call.status = statusCall.nothing;
                call.room = null;
                return call;
            }

            // Проверяем, кто еще ожидает ответа или истекло время
            const pendingUsers = call.room.users.filter(u => {
                // Проверяем, что это не принятый вызов и либо истекло время, либо статус ожидания
                if (u.status != statusUserCall.accept) {
                    // Проверяем время (если поле time существует)
                    if (u.time) {
                        const timeDiff = new Date().getTime() - new Date(u.time).getTime();
                        return timeDiff > this.TIMEOUT_CALL;
                    }
                    // Если времени нет, считаем как ожидающего
                    return true;
                }
                return false;
            });

            // Если все пользователи либо отклонили, либо истекло время
            if (pendingUsers.length > 0 && pendingUsers.length == call.room.users.length) {
                call.status = statusCall.nothing;
                call.room = null;
                return call;
            }


            const users = Array.from(await this.roomService.listParticipants(call.room.roomUID)).map((p: any) => p.identity);
            call.room.users.forEach(user => {
                if (!users.includes(user.UID) && user.status == statusUserCall.accept) {
                    user.status = statusUserCall.leave
                }
            })

        }
        if (call.status == statusCall.inRoom && call.room) {
            const users = Array.from(await this.roomService.listParticipants(call.room.roomUID)).map((p: any) => p.identity);
            if (users.length == 1 && call.incomingCall) {
                const call_from = await this.callModel.findOne({ userUID: call.incomingCall.userUID }).exec();
                if (call_from && call_from.room && call_from.room.roomUID == call.room.roomUID && call_from.room.users) {
                    call_from.room.users.forEach(u => {
                        if (u.UID == call.userUID) {
                            u.status = statusUserCall.leave;
                        }
                    });
                    await call_from.save();
                }
            }
            if (!users.includes(call.userUID)) {

                if (call.room.isAdmin && !users.includes(call.userUID)) {
                    try {
                        await this.roomService.deleteRoom(call.room.roomUID);
                    } catch { }
                }

                call.status = statusCall.nothing;
                call.incomingCall = null;
                call.room = null;
            }
        }
        return call;
    }

}
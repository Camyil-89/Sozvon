// chat.service.ts
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { CallsGateway } from './calls.gateway';
import { RedisService } from 'src/redis/redis.service';
import { Call, statusCall, } from './schemas/call.schemas';
import { RoomService } from 'src/room/room.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

export enum CallsStatus {
    userIsIncomingCall = 1,
    userInRoom = 2,
    CallOK = 3,
    ErrorReadBase = 4,
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
            await this.callModel.create({ userUID: userId, status: statusCall.nothing, online: { is: true } });
        }
        else {
            userCall.online = { is: true, lastTime: null };
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
            call.status = statusCall.nothing;
            call.online.is = false;
            call.online.lastTime = new Date();
            call.incomingCall = null;
            call.room = null;
            call.save();
        }
        else {
            this.userSockets.set(userID, user);
        }
    }

    async sendCallUser(userId: string, from_uid, room_uid): Promise<CallsStatus> {
        console.log(userId, from_uid, room_uid);
        const user_call = await this.callModel.findOne({ userUID: userId }).exec();
        const user_from_call = await this.callModel.findOne({ userUID: from_uid }).exec();

        if (!user_call || !user_from_call) {
            return CallsStatus.ErrorReadBase;
        }

        user_call.incomingCall.time = new Date();

        //let call: StatusCallRedis = await this.redisService.get(`call_${userId}`);
        //if (!call) {
        //    return CallsStatus.ErrorReadRedis;
        //}
        //if (call.status == statusCall.incomingCall) {
        //    return CallsStatus.userIsIncomingCall;
        //}
        //else if (call.status == statusCall.inRoom) {
        //    return CallsStatus.userInRoom;
        //}
        //
        //
        //this.sendWS(userId, "call", { callerUID: from_uid, roomUID: room_uid });
        //
        //await this.redisService.set(`call_${userId}`, {
        //    userUID: userId,
        //    status: statusCall.incomingCall,
        //    incomingCall: {
        //        time: new Date(),
        //        call: { callerUID: from_uid, roomUID: room_uid }
        //    }
        //})
        //
        //await this.redisService.set(`call_${from_uid}`, {
        //    userUID: userId,
        //    status: statusCall.inRoom,
        //    room: {
        //        UID: room_uid,
        //        isAdmin: true,
        //    }
        //})
        return CallsStatus.CallOK;
    }

    async joinRoom(userId: string, roomUID) {
        //await this.redisService.set(`call_${userId}`, {
        //    userUID: userId,
        //    status: statusCall.inRoom,
        //    room: {
        //        UID: roomUID,
        //        isAdmin: false
        //    }
        //})
    }

    async leaveRoom(userId: string) {
        //await this.redisService.set(`call_${userId}`, Object.assign(new StatusCallRedis(), {
        //    userUID: userId,
        //    status: statusCall.nothing
        //}))
    }

    async sendState(usedId: string, socketId: string) {
        const user = await this.callModel.findOne({ userUID: usedId }).exec();
        this.server.to(socketId).emit("call_state", user);
        //let call = await this.redisService.get(`call_${usedId}`);
        //await this.redisService.extendTTL(`call_${usedId}`, 300000);
        //if (call?.incomingCall) {
        //    if (new Date().getTime() - new Date(call?.incomingCall?.time).getTime() > 60000) {
        //        call = {
        //            userUID: usedId,
        //            status: statusCall.nothing,
        //        }
        //        await this.redisService.set(`call_${usedId}`, call)
        //    }
        //}
        //else if (call?.status == statusCall.inRoom) {
        //    if (Array.from(await this.roomService.listParticipants(call?.room?.UID)).map((p: any) => p.identity).length == 0) {
        //        call = {
        //            userUID: usedId,
        //            status: statusCall.nothing,
        //        }
        //        await this.redisService.set(`call_${usedId}`, call)
        //    }
        //}
        //
        //this.sendWS(usedId, "call_state", call);
    }


    async callRejected(userId) {
        //const call = await this.redisService.get(`call_${userId}`);
        //
        //console.log(call);
    }


    sendWS(userId: string, method: string, data: any) {
        let sockets: any = []
        //for (let [key, value] of this.userSockets) {
        //    if (value == userId) {
        //        sockets.push(key);
        //    }
        //}
        //sockets.forEach(id => {
        //    this.server.to(id).emit(method, {
        //        ...data
        //    });
        //});
    }


    async updateCallStatus(call: Call) {

    }

}
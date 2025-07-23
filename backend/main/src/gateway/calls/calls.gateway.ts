import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as cookie from 'cookie';
import { CallsService } from './calls.service';
import { AuthService } from 'src/auth/auth.service';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RedisService } from 'src/redis/redis.service';
@WebSocketGateway({
    transports: ['websocket'],
    cors: {
        origin: 'http://localhost:3000',
        credentials: true,
    },
    namespace: "/calls"
})
export class CallsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private callsService: CallsService,
        private authService: AuthService
    ) { }

    @WebSocketServer()
    server: Server;

    afterInit() {
        this.callsService.setServer(this.server);
    }

    @UseGuards(JwtAuthGuard)
    async handleConnection(client: Socket) {
        try {
            const user = await this.authService.getMeWS(client)
            if (!user)
                throw new UnauthorizedException("User not found");
            await this.callsService.setUserSocket(user.UID, client.id);
        } catch (e) {
            console.log(e);
            client.disconnect(true);
        }
    }

    async handleDisconnect(client: Socket) {
        try {
            const user = await this.authService.getMeWS(client)
            if (!user)
                throw new UnauthorizedException("User not found");

            await this.callsService.removeUserSocket(user.UID, client.id);
            console.log(`User ${user.UID} disconnected`);

        } catch (e) {
            console.log(e);
            client.disconnect(true);
        }
    }
    @UseGuards(JwtAuthGuard)
    @SubscribeMessage('join_room')
    async handleJoinRoom(client: Socket, payload) {
        try {

            const user = await this.authService.getMeWS(client)
            if (!user)
                throw new UnauthorizedException("User not found");
            await this.callsService.joinRoom(user.UID);

        } catch (e) {
            console.log(e);
        }
    }
    @UseGuards(JwtAuthGuard)
    @SubscribeMessage('leave_room')
    async handleLeaveRoom(client: Socket, payload) {
        try {

            const user = await this.authService.getMeWS(client)
            if (!user)
                throw new UnauthorizedException("User not found");
            await this.callsService.leaveRoom(user.UID);
            console.log("leave_room", client.id, payload, user);

        } catch (e) {
            console.log(e);
        }
    }

    @UseGuards(JwtAuthGuard)
    @SubscribeMessage('call_state')
    async handleState(client: Socket) {
        try {
            const user = await this.authService.getMeWS(client)

            if (!user)
                throw new UnauthorizedException("User not found");
            await this.callsService.sendState(user.UID, client.id);

        } catch (e) {
            console.log(e);
        }
    }

    @UseGuards(JwtAuthGuard)
    @SubscribeMessage('cancel_call')
    async handleCancelCal(client: Socket, payload) {
        try {

            const user = await this.authService.getMeWS(client)
            if (!user)
                throw new UnauthorizedException("User not found");
            await this.callsService.leaveRoom(user.UID);

        } catch (e) {
            console.log(e);
        }
    }
    @UseGuards(JwtAuthGuard)
    @SubscribeMessage('call_rejected')
    async handleCallRejected(client: Socket, payload) {
        try {

            const user = await this.authService.getMeWS(client)
            if (!user)
                throw new UnauthorizedException("User not found");
            await this.callsService.callRejected(user.UID);

        } catch (e) {
            console.log(e);
        }
    }
}
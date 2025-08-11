import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';

export enum statusCall {
    inRoom = "in_room",
    incomingCall = "incoming_call",
    nothing = "nothing"
}

export enum statusUserCall {
    accept = "accept",
    reject = "reject",
    wait = "wait",
    leave = "leave",
}

export class Call {
    userUID: string

    status: statusCall = statusCall.nothing

    online: {
        is: boolean,
        lastTime: Date,
    }

    incomingCall?: {
        time: Date;
        userUID: string;
    } | null

    room?: {
        isAdmin: boolean;
        roomUID: string;
        users: { UID: string, status: statusUserCall, time: Date }[] | null
    } | null;
}

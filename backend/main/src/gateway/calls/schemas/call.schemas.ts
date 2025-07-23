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

@Schema({
    timestamps: true,
    toJSON: {
        transform: function (doc, ret: any) {
            if ('__v' in ret) delete ret.__v;
            if ('_id' in ret) delete ret._id;
            if ('createdAt' in ret) delete ret.createdAt;
            if ('updatedAt' in ret) delete ret.updatedAt;
            return ret;
        },
    },
})
export class Call extends Document {
    @Prop({
        required: true,
        index: true
    })
    userUID: string

    @Prop({
        required: true,
        enum: statusCall,
        default: statusCall.nothing
    })
    status: statusCall = statusCall.nothing

    @Prop({
        required: false,
        type: {
            is: { type: Boolean, default: false },
            lastTime: { type: Date, default: new Date() }
        }
    })
    online: {
        is: boolean,
        lastTime: Date,
    }

    @Prop({
        type: {
            time: { type: Date },
            userUID: { type: String }
        },
        required: false
    })
    incomingCall?: {
        time: Date;
        userUID: string;
    } | null

    // in_room
    @Prop({
        type: {
            isAdmin: { type: Boolean },
            roomUID: { type: String },
            users: {
                type: [{
                    UID: { type: String },
                    status: { type: String, enum: Object.values(statusUserCall) },
                    time: { type: Date }
                }]
            }
        },
        required: false
    })
    room?: {
        isAdmin: boolean;
        roomUID: string;
        users: { UID: string, status: statusUserCall, time: Date }[] | null
    } | null;
}

export const CallSchema = SchemaFactory.createForClass(Call);
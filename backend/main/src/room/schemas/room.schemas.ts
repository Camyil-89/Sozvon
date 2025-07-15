import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { Length } from 'class-validator';

@Schema({
    timestamps: true,
    toJSON: {
        transform: function (doc, ret: any) {
            if ('__v' in ret) delete ret.__v;
            return ret;
        },
    },
})
export class Room extends Document {
    @Prop({
        required: true,
        index: true,
        unique: true,
        maxlength: 255,
        default: `room_${Math.floor(Math.random() * 10000000)}`,
    })
    name: string;

    @Prop({
        required: true,
        unique: true,
        index: true,
        maxlength: 255,
    })
    UID: string;

    @Prop({
        required: true,
    })
    usersAdmin: [string] // UID User

    @Prop({
        required: false
    })
    whiteListUsers: [string]

    @Prop({
        required: false
    })
    blackListUsers: [string]

    @Prop({
        required: false
    })
    passwordRoom: string
}

export const RoomSchema = SchemaFactory.createForClass(Room);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from './roles.enum';

@Schema({
    timestamps: true
})
export class User extends Document {
    @Prop({
        required: [true, 'Email обязателен'],
        unique: true,
        lowercase: true,
        index: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Некорректный формат email']
    })
    email: string;

    @Prop({
        required: [true, 'Password обязателен'],
    })
    password: string;

    @Prop({
        type: [String],
        default: [UserRole.USER],
        enum: Object.values(UserRole)
    })
    roles: UserRole[];
}

export const UserSchema = SchemaFactory.createForClass(User);
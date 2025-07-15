import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { UserRole } from './roles.enum';
import { Length } from 'class-validator';

const defaultUID = (
    Math.floor(1000000000000000 + Math.random() * 99999999999999)
        .toString()
        .substring(0, 12)
);


@Schema({
    toJSON: {
        transform: function (doc, ret: any) {
            if ('__v' in ret) delete ret.__v;
            if ('_id' in ret) delete ret._id;
            return ret;
        },
    },
})
export class Profile extends Document {
    @Prop({
        required: true,
        default: `user_${Math.floor(Math.random() * 10000000)}`,
        maxlength: 255
    })
    name: string
    @Prop({
        required: false,
        default: "",
        maxlength: 128
    })
    imageProfile: string
}

@Schema({
    timestamps: true,
    toJSON: {
        transform: function (doc, ret: any) {
            if ('__v' in ret) delete ret.__v;
            if ('_id' in ret) delete ret._id;
            return ret;
        },
    },
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
        required: true,
        unique: true,
        lowercase: true,
        index: true,
        maxlength: 12,
        default: defaultUID,
    })
    UID: string

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
    @Prop({
        required: true,
        type: Profile,
        default: () => ({}),
    })
    profile: Profile
}

export const UserSchema = SchemaFactory.createForClass(User);



UserSchema.pre('save', async function (next) {

    const model = this.constructor as Model<User>;
    let isUnique = false;

    while (!isUnique) {
        const uid = defaultUID;
        try {
            const exists = await model.findOne({ UID: this.UID });
            if (!exists) isUnique = true;
            else
                this.UID = uid;
        } catch (err) {
            return next(err);
        }
    }
    next();
});
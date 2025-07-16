import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forRoot('mongodb://room_service_sozvon_user:room_sozvon_service@192.168.1.71:27017/room_sozvon_service?authSource=room_sozvon_service', {
            retryAttempts: 3,
            retryDelay: 1000,
            connectionName: 'roomDB', // Указываем имя подключения здесь
        }),
    ],
    exports: [MongooseModule],
})
export class RoomDatabaseModule { }
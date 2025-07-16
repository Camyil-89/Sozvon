// src/database/auth-database.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forRoot('mongodb://auth_service_sozvon_user:auth_sozvon_service@192.168.1.71:27017/auth_sozvon_service?authSource=auth_sozvon_service', {
            retryAttempts: 3,
            retryDelay: 1000,
            connectionName: 'authDB', // Указываем имя подключения здесь
        }),
    ],
    exports: [MongooseModule],
})
export class AuthDatabaseModule { }
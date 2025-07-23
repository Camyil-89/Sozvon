// src/database/auth-database.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/calls_sozvon_service', {
            retryAttempts: 3,
            retryDelay: 1000,
            connectionName: 'callsDB', // Указываем имя подключения здесь
        }),
    ],
    exports: [MongooseModule],
})
export class CallsDatabaseModule { }
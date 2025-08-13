// redis.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    private readonly client: Redis;
    private readonly namespace: string = "sozvon"
    constructor(private configService: ConfigService) {
        this.client = new Redis({
            host: this.configService.get("REDIS"),
            port: this.configService.get("REDIS_PORT"),
        });
        this.flushNamespace().then();
    }

    getClient(): Redis {

        return this.client;
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        // Добавляем namespace если его нет
        if (!key.startsWith(this.namespace)) {
            key = `${this.namespace}:${key}`;
        }

        // Преобразуем значение в строку
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

        if (ttl) {
            await this.client.set(key, stringValue, 'EX', ttl); // ttl в секундах
        } else {
            await this.client.set(key, stringValue);
        }
    }

    async extendTTL(key: string, ttl: number): Promise<boolean> {
        if (!key.startsWith(this.namespace)) {
            key = `${this.namespace}:${key}`;
        }

        // Устанавливаем новое время жизни для существующего ключа
        const result = await this.client.expire(key, ttl);
        return result === 1; // 1 = успех, 0 = ключ не существует
    }

    async get(key: string) {
        if (!key.startsWith(this.namespace)) {
            key = `${this.namespace}:${key}`
        }
        const result = await this.client.get(key);
        if (result == null) {
            return null
        }
        return JSON.parse(result);
    }

    async del(key: string): Promise<number> {
        if (!key.startsWith(this.namespace)) {
            key = `${this.namespace}:${key}`
        }
        return this.client.del(key);
    }

    async keys(pattern: string): Promise<string[]> {
        if (!pattern.startsWith(this.namespace)) {
            pattern = `${this.namespace}:${pattern}`
        }
        return this.client.keys(pattern);
    }

    async flushNamespace(): Promise<void> {
        const pattern = `${this.namespace}:*`;
        const stream = this.client.scanStream({
            match: pattern,
            count: 100,
        });

        stream.on('data', (keys) => {
            if (keys.length) {
                this.client.unlink(...keys);
            }
        });

        return new Promise((resolve, reject) => {
            stream.on('end', resolve);
            stream.on('error', reject);
        });
    }
}
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalFilters(new GlobalExceptionFilter());
	app.setGlobalPrefix('api');
	app.use(cookieParser());
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			stopAtFirstError: true,
		})
	);
	// Включение CORS с настройками
	app.enableCors({
		origin: 'http://localhost:3000', // или массив origin'ов
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		credentials: true, // если используете куки/авторизацию
	});
	const config = new DocumentBuilder()
		.setTitle('Users API')
		.setDescription('The users API description')
		.setVersion('1.0')
		.addTag('main API')
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('swag', app, document);
	await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

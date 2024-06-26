import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api/v2');
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            //lanza error en caso de que se envia campso que no son necesarios
            forbidNonWhitelisted: true,
            //transforma en number datos que son enviados como string automaticamente
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );
    await app.listen(process.env.PORT);
    console.log(`App running on port ${process.env.PORT}`);
}
bootstrap();

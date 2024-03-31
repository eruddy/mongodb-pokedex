import { join } from 'path'; //en Node
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PokemonModule } from './pokemon/pokemon.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { ConfigModule } from '@nestjs/config';
import { EnvConfiguration } from './config/app.config';
import { JoiValidationSchema } from './config/joi.validation';

@Module({
    imports: [
        //se recomienda ponero al inicio para evitar problemas
        ConfigModule.forRoot({
            // envFilePath
            load: [EnvConfiguration],

            validationSchema: JoiValidationSchema, //PERMITE Validar las variables de entorno
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
        }),
        MongooseModule.forRoot(process.env.MONGODB, {
            dbName: process.env.DB_NAME,
        }),
        PokemonModule,
        CommonModule,
        SeedModule,
    ],
})
export class AppModule {}

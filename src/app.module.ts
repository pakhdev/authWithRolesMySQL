import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: 'mariadb',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: process.env.MYSQL_ROOT_PASS,
            database: process.env.MYSQL_DB_NAME,
            autoLoadEntities: true,
            synchronize: true,
        }),
        AuthModule,
    ],
})
export class AppModule {
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { EventsModule } from './events/events.module';
import { UploadModule } from './upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { VolunteersModule } from './volunteers/volunteers.module';
import { EventVolunteersModule } from './event-volunteers/event-volunteers.module';
import { TasksModule } from './tasks/tasks.module';
import { MailModule } from './mail/mail.module';
import { ChatModule } from './chat/chat.module';
import { EventResourcesModule } from './event-resources/event-resources.module';

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Looking for env file:', `.env.${process.env.NODE_ENV}`);

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log('Database Config:', {
          host: configService.get('MYSQL_HOST'),
          port: configService.get('MYSQL_PORT'),
          username: configService.get('MYSQL_USER'),
          database: configService.get('MYSQL_DATABASE'),
          hasPassword: !!configService.get('MYSQL_PASSWORD'),
        });

        return {
          type: 'mysql',
          host: configService.get('MYSQL_HOST', 'localhost'),
          port: configService.get('MYSQL_PORT', 3306),
          username: configService.get('MYSQL_USER'),
          password: configService.get('MYSQL_PASSWORD'),
          database: configService.get('MYSQL_DATABASE'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          timezone: 'Z',
        };
      },
    }),
    AuthModule,
    UsersModule,
    EventsModule,
    UploadModule,
    VolunteersModule,
    EventVolunteersModule,
    TasksModule,
    MailModule,
    ChatModule,
    EventResourcesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}

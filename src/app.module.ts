import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiModule } from './api/api.module';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.getMongoDbUri(),
        connectionFactory: (connection) => {
          connection.on('connected', () => {
            console.log('MongoDB connected successfully');
          });
          connection.once('open', () => {
            console.log('MongoDB connection opened');
          });
          connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
          });
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'single',
        options: {
          host: configService.getRedisHost(),
          port: parseInt(configService.getRedisPort()),
          password: configService.getRedisPassword(),
          connectTimeout: 10000,
          lazyConnect: true,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          tls: {
            rejectUnauthorized: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    ApiModule
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [],
})
export class AppModule { }

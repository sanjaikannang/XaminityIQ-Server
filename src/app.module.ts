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
          host: "redis-13245.c264.ap-south-1-1.ec2.redns.redis-cloud.com",
          port: 13245,
          password: "D1DTQxZkseU03NgsvqCIIQDWzD2QWtls",
          username: "default",
          connectTimeout: 10000,
          lazyConnect: true,
          keepAlive: 1000,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          // tls: {
          //   rejectUnauthorized: false,
          // },

          // Add error handling
          onReady: () => {
            console.log('Redis connected successfully');
          },
          onError: (error) => {
            console.error('Redis connection error:', error);
          },
          onReconnect: () => {
            console.log('Redis reconnecting...');
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

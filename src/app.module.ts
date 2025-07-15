import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { MongooseModule } from '@nestjs/mongoose';

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
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [],
})
export class AppModule { }

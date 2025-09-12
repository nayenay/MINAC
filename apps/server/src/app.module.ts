import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MonitoreoController } from './monitoreo.controller';
import { MonitoreoService } from './monitoreo.service';
import * as dotenv from 'dotenv';
import { MongooseModule } from '@nestjs/mongoose';

dotenv.config({ path: process.cwd() + '/.env' });

@Module({
  imports: [
    ...(process.env.MONGO_URL ? [MongooseModule.forRoot(process.env.MONGO_URL as string)] : []),
  ],
  controllers: [AppController, MonitoreoController],
  providers: [AppService, MonitoreoService],
})
export class AppModule {}

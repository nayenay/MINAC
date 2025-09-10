import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as dotenv from 'dotenv';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

dotenv.config({ path: process.cwd() + '/.env' });

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGO_URL || '')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

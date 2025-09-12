import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as dotenv from 'dotenv';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EquiposModule } from './equipos/equipos.module';

dotenv.config({ path: process.cwd() + '/.env' });

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGO_URL || ''), EquiposModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

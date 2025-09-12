import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirestoreModule } from './firestore.module';
import { MongooseModule } from '@nestjs/mongoose';
import { EquiposModule } from './equipos/equipos.module';
import * as dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

@Module({
  imports: [
    FirestoreModule,
    MongooseModule.forRoot(process.env.MONGO_URL as string),
    EquiposModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

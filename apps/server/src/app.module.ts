import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MonitoreoController } from './monitoreo.controller';
import { MonitoreoService } from './monitoreo.service';

// Si ya existen, mantenlos. No los dupliques.
import { FirestoreModule } from './firestore.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

@Module({
  imports: [
    // Incluye FirestoreModule solo si existe
    ...(typeof FirestoreModule !== 'undefined' ? [FirestoreModule] : []),
    // Incluye Mongoose solo si lo usas y tienes MONGO_URL
    ...(process.env.MONGO_URL ? [MongooseModule.forRoot(process.env.MONGO_URL as string)] : []),
  ],
  controllers: [AppController, MonitoreoController],
  providers: [AppService, MonitoreoService],
})
export class AppModule {}

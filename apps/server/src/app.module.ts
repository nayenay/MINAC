import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EquiposModule } from './equipos/equipos.module';
import { MonitoreoModule } from './monitoreo/monitoreo.module';
import { FirebaseModule } from './firebase/firebase.module';
import * as dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL as string),
    EquiposModule,
    MonitoreoModule,
    FirebaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

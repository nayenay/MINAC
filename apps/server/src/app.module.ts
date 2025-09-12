import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirestoreModule } from './firestore.module';
import { MongooseModule } from '@nestjs/mongoose';
<<<<<<< HEAD
import { EquiposModule } from './equipos/equipos.module';
=======
import * as dotenv from 'dotenv';
>>>>>>> 8d515d7 ( primer deploy de api 1.0)

dotenv.config({ path: process.cwd() + '/.env' });

@Module({
<<<<<<< HEAD
  imports: [MongooseModule.forRoot(process.env.MONGO_URL || ''), EquiposModule],
=======
  imports: [
    FirestoreModule,
    MongooseModule.forRoot(process.env.MONGO_URL as string),
  ],
>>>>>>> 8d515d7 ( primer deploy de api 1.0)
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

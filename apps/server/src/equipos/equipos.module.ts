import { Module } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { EquiposController } from './equipos.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Equipo, EquipoSchema } from '../schemas/equipo.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Equipo', schema: EquipoSchema }])],
  controllers: [EquiposController],
  providers: [EquiposService],
})
export class EquiposModule {}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';
import { Equipo } from '../schemas/equipo.schema';

@Injectable()
export class EquiposService {
  constructor(@InjectModel(Equipo.name) private equipoModel: Model<Equipo>) {}

  async create(createEquipoDto: CreateEquipoDto) {
    const createdEquipo = new this.equipoModel(createEquipoDto);
    return createdEquipo.save();
  }

  async findAll() {
    return this.equipoModel.find().exec();
  }
}

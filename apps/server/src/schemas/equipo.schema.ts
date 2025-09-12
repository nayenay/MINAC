import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose';

@Schema()
export class Equipo {
  @Prop({required: true, unique: true, trim: true})
  _id: string;

  @Prop({trim: true})
  ubicacion: string;

  @Prop({trim: true})
  altura: string;   
}

export const EquipoSchema = SchemaFactory.createForClass(Equipo);
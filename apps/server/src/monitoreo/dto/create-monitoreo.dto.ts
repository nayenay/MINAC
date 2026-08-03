import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsIn,
} from 'class-validator';

export class CreateMonitoreoDto {
  @IsString()
  @IsNotEmpty()
  idEquipo: string;

  @IsNumber()
  mq2: number;

  @IsNumber()
  mq3: number;

  @IsNumber()
  mq135: number;

  @IsNumber()
  mq9: number;

  @IsNumber()
  @IsOptional()
  timestamp?: number;

  @IsString()
  @IsOptional()
  @IsIn(['directo', 'retransmitido'])
  via?: 'directo' | 'retransmitido';

  @IsString()
  @IsOptional()
  retransmitidoPor?: string;

  // Lista separada por comas de sensores cuya lectura salió del rango
  // validado del datasheet en esta muestra (ej. "MQ-135,MQ-9"). Vacío
  // si todos los sensores dieron lecturas confiables.
  @IsString()
  @IsOptional()
  fueraDeRango?: string;
}

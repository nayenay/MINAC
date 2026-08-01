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
  mq7: number;

  @IsNumber()
  mq135: number;

  @IsNumber()
  mq136: number;

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
}

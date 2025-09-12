import { IsString, MinLength } from 'class-validator';

export class MonitoreoDto {
  @IsString() @MinLength(1) idEquipo: string;
  @IsString() @MinLength(1) gas: string;
  @IsString() @MinLength(1) temperatura: string;
}

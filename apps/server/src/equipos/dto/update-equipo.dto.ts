import { PartialType } from '@nestjs/mapped-types';
import { CreateEquipoDto } from './create-equipo.dto';
 import { IsString, IsBoolean, IsOptional, IsNotEmpty} from "class-validator";
export class UpdateEquipoDto extends PartialType(CreateEquipoDto) {
        @IsString()
        @IsNotEmpty()
        _id: string;
    
        @IsString()
        @IsOptional()
        ubicacion?: string;
    
        @IsString()
        @IsOptional()
        altura?: string;
}

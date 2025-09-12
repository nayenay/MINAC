 import { IsString, IsBoolean, IsOptional, IsNotEmpty} from "class-validator";
export class CreateEquipoDto {
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


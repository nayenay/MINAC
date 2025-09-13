import { IsString, IsBoolean, IsOptional, IsNotEmpty} from "class-validator";

export class CreateMonitoreoDto {
    @IsString()
    @IsNotEmpty()
    idEquipo: string;

    @IsString()
    gas: string;

    @IsString()
    temperatura: string;
}

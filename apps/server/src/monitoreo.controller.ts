import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { MonitoreoService } from './monitoreo.service';
import { MonitoreoDto } from './monitoreo.dto';

@Controller('monitoreo')
export class MonitoreoController {
  constructor(private readonly service: MonitoreoService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async crear(@Body() body: MonitoreoDto) {
    const { idEquipo, gas, temperatura } = body;
    return this.service.upsert(idEquipo, gas, temperatura);
  }

  @Get(':idEquipo')
  async obtener(@Param('idEquipo') idEquipo: string) {
    return this.service.getOne(idEquipo);
  }
}

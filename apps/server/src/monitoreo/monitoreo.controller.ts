import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MonitoreoService } from './monitoreo.service';
import { CreateMonitoreoDto } from './dto/create-monitoreo.dto';

@Controller('monitoreo')
export class MonitoreoController {
  constructor(private readonly monitoreoService: MonitoreoService) {}

  @Post()
  create(@Body() createMonitoreoDto: CreateMonitoreoDto) {
    return this.monitoreoService.create(createMonitoreoDto);
  }

  @Get()
  findAll() {
    return this.monitoreoService.findAll();
  }

  @Get('historico/:idEquipo')
  findHistorico(@Param('idEquipo') idEquipo: string) {
    return this.monitoreoService.findHistorico(idEquipo);
  }
}

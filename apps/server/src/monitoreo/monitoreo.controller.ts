import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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
}

import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('users/:uid')
  createUser(@Param('uid') uid: string, @Body() body: any) {
    return this.appService.createUser(uid, body);
  }

  @Get('users/:uid')
  getUser(@Param('uid') uid: string) {
    return this.appService.getUser(uid);
  }

  @Get()
  root() {
    return this.appService.getHello();
  }
}

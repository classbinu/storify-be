import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotiService } from './noti.service';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';

@ApiTags('Noti')
@Controller('noti')
export class NotiController {
  constructor(private readonly notiService: NotiService) {}

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get('sendMissedNotifications')
  async sendMissedNotifications(@Req() req: any) {
    const userObjectId = req.user.sub;
    return await this.notiService.sendMissedNotifications(userObjectId);
  }
}

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { MailService } from './mail.service';
import { AccessTokenGuard } from '../../src/auth/guards/accessToken.guard';
import { FeedbackMailDto } from './dto/feedback-mail.dto';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Post('feedback')
  async sendFeedbackMeil(@Req() req, @Body() feedbackMailDto: FeedbackMailDto) {
    const userId = req.user['sub'];

    if (!feedbackMailDto.feedback) {
      throw new Error('Feedback is required');
    }

    return this.mailService.sendFeedbackMail(feedbackMailDto, userId);
  }
}

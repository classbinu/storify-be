import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateFriendReqDto } from './dto/create-friendReq.dto';
import { UpdateFriendReqDto } from './dto/update-friendReq.dto';
import { FriendReqsService } from './friendReqs.service';
import { FriendReq } from './schema/friendReq.schema';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';

@ApiTags('FriendsReqs')
@Controller('friendsReqs')
export class FriendReqsController {
  constructor(private readonly friendsService: FriendReqsService) {}

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Post()
  createFriendReq(
    @Body() createFriendDto: CreateFriendReqDto,
    @Req() req,
  ): Promise<FriendReq> {
    createFriendDto.sender = req.user.sub;
    return this.friendsService.createFriendReq(createFriendDto);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findByUserId(
    @Param('id') id: string,
  ): Promise<{ sent: FriendReq[]; received: FriendReq[] }> {
    return this.friendsService.findByUserId(id);
  }

  @Get()
  findAll(): Promise<FriendReq[]> {
    return this.friendsService.findAll();
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Patch(':id')
  async updateFriendReq(
    @Body() updateFriendReqDto: UpdateFriendReqDto,
    @Req() req,
  ): Promise<FriendReq> {
    const currentUserId = req.user.sub;
    return this.friendsService.updateFriendReq(
      updateFriendReqDto,
      currentUserId,
    );
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Delete(':id')
  deleteFriendReq(@Param('id') id: string): Promise<FriendReq> {
    return this.friendsService.deleteFriendReq(id);
  }
}

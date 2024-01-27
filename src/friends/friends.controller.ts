import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { Friend } from './schema/friend.schema';
import { FriendsService } from './friends.service';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { Types } from 'mongoose';

@ApiTags('Friends')
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post()
  async createFriend(
    @Body() createFriendDto: CreateFriendDto,
  ): Promise<Friend> {
    return this.friendsService.createFriend(createFriendDto);
  }

  @Get()
  async findAll(): Promise<Friend[]> {
    return this.friendsService.findAll();
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get(':id')
  async getFriendsByUserId(@Req() req): Promise<Types.ObjectId[]> {
    const userId = req.user.sub;
    return this.friendsService.getFriendsByUserId(userId);
  }

  @Patch(':id')
  async updateFriend(
    @Param('id') id: string,
    @Body() updateFriendDto: UpdateFriendDto,
  ): Promise<Friend> {
    return this.friendsService.updateFriend(id, updateFriendDto);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiBody({ schema: { example: { friendUsername: 'exampleUsername' } } })
  async deleteFriend(
    @Req() req,
    @Body('friendUsername') friendUsername: string,
  ): Promise<Friend> {
    const userId = req.user.sub;
    return this.friendsService.deleteFriend(userId, friendUsername);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateFriendDto } from './dto/create-friend.dto';
import { Friend } from './schema/friend.schema';
import { FriendsService } from './friends.service';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';

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
  async getFriendsByUserId(@Req() req): Promise<string[]> {
    const userId = req.user.sub;
    return this.friendsService.getFriendsByUserId(userId);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiBody({ schema: { example: { friendUserId: 'exampleUserId' } } })
  async deleteFriend(
    @Req() req,
    @Body('friendUserId') friendUserId: string,
  ): Promise<Friend> {
    const userId = req.user.sub;
    return this.friendsService.deleteFriend(userId, friendUserId);
  }
}

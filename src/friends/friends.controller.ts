import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { Friend } from './schema/friend.schema';
import { FriendsService } from './friends.service';

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

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Friend> {
    return this.friendsService.findOne(id);
  }

  @Patch(':id')
  async updateFriend(
    @Param('id') id: string,
    @Body() updateFriendDto: UpdateFriendDto,
  ): Promise<Friend> {
    return this.friendsService.updateFriend(id, updateFriendDto);
  }

  @Delete(':id')
  async deleteFriend(@Param('id') id: string): Promise<Friend> {
    return this.friendsService.deleteFriend(id);
  }
}

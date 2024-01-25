import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { CreateFriendReqDto } from './dto/create-friendReq.dto';
import { UpdateFriendReqDto } from './dto/update-friendReq.dto';
import { FriendsService } from './friendReqs.service';
import { FriendReq } from './schema/friendReq.schema';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post()
  createFriendReq(
    @Body() createFriendDto: CreateFriendReqDto,
  ): Promise<FriendReq> {
    return this.friendsService.createFriendReq(createFriendDto);
  }

  @Get()
  findAll(): Promise<FriendReq[]> {
    return this.friendsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<FriendReq> {
    return this.friendsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFriendDto: UpdateFriendReqDto,
  ): Promise<FriendReq> {
    return this.friendsService.update(id, updateFriendDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<FriendReq> {
    return this.friendsService.delete(id);
  }
}

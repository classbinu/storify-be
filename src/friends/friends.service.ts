import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { Friend } from './schema/friend.schema';
import { FriendsMongoRepository } from './friends.repository';
import { UserMongoRepository } from 'src/users/users.repository';
import { Types } from 'mongoose';

@Injectable()
export class FriendsService {
  constructor(
    private readonly friendsMongoRepository: FriendsMongoRepository,
    private readonly userMongoRepository: UserMongoRepository,
  ) {}

  async createFriend(createFriendDto: CreateFriendDto): Promise<Friend> {
    return this.friendsMongoRepository.createFriend(createFriendDto);
  }

  async findAll(): Promise<Friend[]> {
    return this.friendsMongoRepository.findAll();
  }

  async getFriendsByUserId(userId: string): Promise<Types.ObjectId[]> {
    return this.friendsMongoRepository.getFriendsByUserId(userId);
  }

  async updateFriend(
    id: string,
    updateFriendDto: UpdateFriendDto,
  ): Promise<Friend> {
    const updatedFriend = await this.friendsMongoRepository.updateFriend(
      id,
      updateFriendDto,
    );
    if (!updatedFriend) {
      throw new NotFoundException(`Friend with id ${id} not found.`);
    }
    return updatedFriend;
  }

  async deleteFriend(userId: string, friendUsername: string): Promise<Friend> {
    const friendId = (
      await this.userMongoRepository.findByUsername(friendUsername)
    )._id.toString();
    const removedFriend = await this.friendsMongoRepository.deleteFriend(
      userId,
      friendId,
    );
    if (!removedFriend) {
      throw new NotFoundException(`Friend with id ${friendId} not found.`);
    }
    return removedFriend;
  }
}

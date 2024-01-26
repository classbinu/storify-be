import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { Friend } from './schema/friend.schema';
import { FriendsMongoRepository } from './friends.repository';

@Injectable()
export class FriendsService {
  constructor(
    private readonly friendsMongoRepository: FriendsMongoRepository,
  ) {}

  async createFriend(createFriendDto: CreateFriendDto): Promise<Friend> {
    return this.friendsMongoRepository.createFriend(createFriendDto);
  }

  async findAll(): Promise<Friend[]> {
    return this.friendsMongoRepository.findAll();
  }

  async findOne(id: string): Promise<Friend> {
    const friend = await this.friendsMongoRepository.findOne(id);
    if (!friend) {
      throw new NotFoundException(`Friend with id ${id} not found.`);
    }
    return friend;
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

  async deleteFriend(id: string): Promise<Friend> {
    const removedFriend = await this.friendsMongoRepository.deleteFriend(id);
    if (!removedFriend) {
      throw new NotFoundException(`Friend with id ${id} not found.`);
    }
    return removedFriend;
  }
}

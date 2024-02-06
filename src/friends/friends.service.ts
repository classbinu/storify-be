import { Injectable } from '@nestjs/common';
import { CreateFriendDto } from './dto/create-friend.dto';
import { Friend } from './schema/friend.schema';
import { FriendsMongoRepository } from './friends.repository';
import { UserMongoRepository } from 'src/users/users.repository';

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

  async getFriendsByUserId(userId: string): Promise<string[]> {
    return this.friendsMongoRepository.getFriendsByUserId(userId);
  }

  async deleteFriend(userId: string, friendUserId: string): Promise<Friend> {
    const friendId = (
      await this.userMongoRepository.findByUserId(friendUserId)
    )._id.toString();
    return await this.friendsMongoRepository.deleteFriend(userId, friendId);
  }
}

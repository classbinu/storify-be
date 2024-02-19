import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateFriendDto } from './dto/create-friend.dto';
import { Friend, FriendDocument } from './schema/friend.schema';
import { UserMongoRepository } from 'src/users/users.repository';

@Injectable()
export class FriendsMongoRepository {
  constructor(
    @InjectModel(Friend.name) private friendModel: Model<FriendDocument>,
    private readonly userMongoRepository: UserMongoRepository,
  ) {}

  async createFriend(createFriendDto: CreateFriendDto): Promise<Friend> {
    const newFriend = new this.friendModel(createFriendDto);
    return newFriend.save();
  }

  async findAll(): Promise<Friend[]> {
    return this.friendModel.find().exec();
  }

  async getFriendsByUserId(userId: string): Promise<string[]> {
    try {
      const objectIdUserId = new Types.ObjectId(userId);
      const user = await this.friendModel.findOne({ user: objectIdUserId });
      if (!user) {
        throw new NotFoundException(`${userId} 사용자를 찾을 수 없어요.`);
      }
      // user.friends가 Types.ObjectId[] 타입이라면, 각각의 ObjectId를 string으로 변환합니다.
      const friendIds = user.friends.map((friendId) => friendId.toHexString());

      // 각각의 친구 id로 사용자 정보를 불러옵니다.
      const friends = await Promise.all(
        friendIds.map((id) => this.userMongoRepository.findById(id)),
      );

      // 반환값을 사용자의 이름으로 변환합니다.
      return friends.map((friend) => friend.userId);
    } catch (error) {
      Logger.error(`getFriendsByUserId 실패: ${error.message}`);
      throw new Error(`친구 목록 불러오기 실패했어요. 다시 시도해 주세요.`);
    }
  }

  async addFriend(userId: string, friendId: string): Promise<Friend> {
    const objectIdUserId = new Types.ObjectId(userId);
    const objectIdFriendId = new Types.ObjectId(friendId);
    const userFriend = await this.friendModel.findOne({
      user: objectIdUserId,
    });
    try {
      if (!userFriend) {
        throw new NotFoundException(`${userId} 사용자를 찾을 수 없어요.`);
      }
      if (userFriend.friends.includes(objectIdFriendId)) {
        throw new BadRequestException(`이미 친구예요!`);
      }
      userFriend.friends.push(objectIdFriendId);
      await userFriend.save();

      const friendUser = await this.friendModel.findOne({
        user: objectIdFriendId,
      });
      if (!friendUser) {
        throw new NotFoundException(`${friendId}를 찾을 수 없어요.`);
      }
      if (friendUser.friends.includes(objectIdUserId)) {
        throw new BadRequestException(`이미 친구예요!`);
      }
      friendUser.friends.push(objectIdUserId);
      return await friendUser.save();
    } catch (error) {
      Logger.error(`addFriend 실패: ${error.message}`);
      throw new Error(`친구 추가 실패했어요. 다시 시도해 주세요.`);
    }
  }

  async deleteFriend(userId: string, friendId: string): Promise<Friend> {
    try {
      const user = await this.friendModel.findOne({
        user: new Types.ObjectId(userId),
      });
      if (!user) {
        throw new NotFoundException(`유저를 찾을 수 없어요.`);
      }
      const friendIndex = user.friends
        .map((id) => id.toString())
        .indexOf(friendId);
      if (friendIndex > -1) {
        user.friends.splice(friendIndex, 1);
        await user.save();
      }

      const friend = await this.friendModel.findOne({
        user: new Types.ObjectId(friendId),
      });
      if (!friend) {
        throw new NotFoundException(`친구를 찾을 수 없어요.`);
      }
      const userIndex = friend.friends
        .map((id) => id.toString())
        .indexOf(userId);
      if (userIndex > -1) {
        friend.friends.splice(userIndex, 1);
        return await friend.save();
      }
    } catch (error) {
      Logger.error(`deleteFriend 실패: ${error.message}`);
      throw new Error(`친구 삭제 실패했어요. 다시 시도해 주세요.`);
    }
  }
}

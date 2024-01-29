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

@Injectable()
export class FriendsMongoRepository {
  constructor(
    @InjectModel(Friend.name) private friendModel: Model<FriendDocument>,
  ) {}

  async createFriend(createFriendDto: CreateFriendDto): Promise<Friend> {
    const newFriend = new this.friendModel(createFriendDto);
    return newFriend.save();
  }

  async findAll(): Promise<Friend[]> {
    return this.friendModel.find().exec();
  }

  async getFriendsByUserId(userId: string): Promise<Types.ObjectId[]> {
    try {
      const objectIdUserId = new Types.ObjectId(userId);
      const user = await this.friendModel.findOne({ user: objectIdUserId });
      if (!user) {
        throw new NotFoundException(
          `Friend model for user with id ${userId} not found.`,
        );
      }
      return await user.friends;
    } catch (error) {
      Logger.error(`getFriendsByUserId 실패: ${error.message}`);
      throw new Error(`친구 목록 불러오기 실패했습니다. 다시 시도해 주세요.`);
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
        throw new NotFoundException(
          `Friend model for user with id ${userId} not found.`,
        );
      }
      if (userFriend.friends.includes(objectIdFriendId)) {
        throw new BadRequestException(
          `User with id ${friendId} is already a friend.`,
        );
      }
      userFriend.friends.push(objectIdFriendId);
      await userFriend.save();

      const friendUser = await this.friendModel.findOne({
        user: objectIdFriendId,
      });
      if (!friendUser) {
        throw new NotFoundException(
          `Friend model for user with id ${friendId} not found.`,
        );
      }
      if (friendUser.friends.includes(objectIdUserId)) {
        throw new BadRequestException(
          `User with id ${userId} is already a friend.`,
        );
      }
      friendUser.friends.push(objectIdUserId);
      return await friendUser.save();
    } catch (error) {
      Logger.error(`addFriend 실패: ${error.message}`);
      throw new Error(`친구 추가 실패했습니다. 다시 시도해 주세요.`);
    }
  }

  async deleteFriend(userId: string, friendId: string): Promise<Friend> {
    try {
      const user = await this.friendModel.findOne({
        user: new Types.ObjectId(userId),
      });
      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found.`);
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
        throw new NotFoundException(`Friend with id ${friendId} not found.`);
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
      throw new Error(`친구 삭제 실패했습니다. 다시 시도해 주세요.`);
    }
  }
}

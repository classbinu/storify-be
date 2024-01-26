import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
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

  async findOne(id: string): Promise<Friend> {
    return this.friendModel.findById(id).exec();
  }

  async addFriend(
    userId: Types.ObjectId,
    friendId: Types.ObjectId,
  ): Promise<Friend> {
    const friend = await this.friendModel.findById(userId);
    if (!friend) {
      throw new NotFoundException(`User with id ${userId} not found.`);
    }
    friend.friends.push(friendId);
    return friend.save();
  }

  async updateFriend(
    id: string,
    updateFriendDto: UpdateFriendDto,
  ): Promise<Friend> {
    return this.friendModel
      .findByIdAndUpdate(id, updateFriendDto, { new: true })
      .exec();
  }

  async deleteFriend(id: string): Promise<Friend> {
    return this.friendModel.findByIdAndDelete(id).exec();
  }
}

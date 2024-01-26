import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateFriendReqDto } from './dto/create-friendReq.dto';
import { UpdateFriendReqDto } from './dto/update-friendReq.dto';
import { FriendReq, FriendReqDocument } from './schema/friendReq.schema';

@Injectable()
export class FriendReqMongoRepository {
  constructor(
    @InjectModel(FriendReq.name)
    private friendReqModel: Model<FriendReqDocument>,
  ) {}

  async createFriendReq(
    createFrienReqdDto: CreateFriendReqDto,
  ): Promise<FriendReq> {
    // 이미 진행 중인 신청 건이 있는지 확인
    const existingFriendReq = await this.friendReqModel.findOne({
      $or: [
        {
          sender: createFrienReqdDto.sender,
          receiver: createFrienReqdDto.receiver,
          status: '대기',
        },
        {
          sender: createFrienReqdDto.receiver,
          receiver: createFrienReqdDto.sender,
          status: '대기',
        },
      ],
    });

    if (existingFriendReq) {
      throw new Error(
        'There is already a pending friend request between these users',
      );
    }

    // 5회 이상 거절한 이력이 있는지 확인
    const rejectedFriendReqCount = await this.friendReqModel.countDocuments({
      sender: createFrienReqdDto.sender,
      receiver: createFrienReqdDto.receiver,
      status: '거절',
    });

    if (rejectedFriendReqCount >= 5) {
      throw new Error(
        'Your friend request has been rejected more than 5 times',
      );
    }

    const newFriendReq = new this.friendReqModel(createFrienReqdDto);
    return newFriendReq.save();
  }

  async findByUserId(
    userId: Types.ObjectId,
  ): Promise<{ sent: FriendReq[]; received: FriendReq[] }> {
    const sent = await this.friendReqModel.find({
      sender: userId.toHexString(),
    });
    const received = await this.friendReqModel.find({
      receiver: userId.toHexString(),
    });
    return { sent, received };
  }

  async findAll(): Promise<FriendReq[]> {
    return this.friendReqModel.find().exec();
  }

  async findById(id: Types.ObjectId): Promise<FriendReq> {
    return this.friendReqModel.findById(id).exec();
  }

  async updateFriendReq(
    updateFriendReqDto: UpdateFriendReqDto,
  ): Promise<FriendReq> {
    const { sender, receiver, status } = updateFriendReqDto;

    const friendReq = await this.friendReqModel.findOne({
      sender: sender,
      receiver: receiver,
    });

    if (!friendReq) {
      throw new NotFoundException('Friend request not found');
    }

    friendReq.status = status;
    return friendReq.save();
  }

  async deleteFriendReq(id: Types.ObjectId): Promise<FriendReq> {
    return this.friendReqModel.findByIdAndDelete(id).exec();
  }
}

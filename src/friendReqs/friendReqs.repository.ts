import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
    try {
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
        throw new Error('이미 존재하는 친구 신청입니다.');
      }

      // 5회 이상 거절한 이력이 있는지 확인
      const rejectedFriendReqCount = await this.friendReqModel.countDocuments({
        sender: createFrienReqdDto.sender,
        receiver: createFrienReqdDto.receiver,
        status: '거절',
      });

      if (rejectedFriendReqCount >= 5) {
        throw new Error('5번 이상 거절 기록이 존재합니다.');
      }

      const newFriendReq = new this.friendReqModel(createFrienReqdDto);
      return await newFriendReq.save();
    } catch (error) {
      Logger.error(`createFriendReq 실패: ${error.message}`);
      throw new Error(`친구 신청 실패했습니다. 다시 시도해 주세요.`);
    }
  }

  async findByUserId(
    userId: string,
  ): Promise<{ sent: FriendReq[]; received: FriendReq[] }> {
    try {
      const sent = await this.friendReqModel.find({
        sender: userId,
      });
      const received = await this.friendReqModel.find({
        receiver: userId,
      });
      return await { sent, received };
    } catch (error) {
      Logger.error(`findByUserId 실패: ${error.message}`);
      throw new Error(
        `친구 신청 목록 불러오기 실패했습니다. 다시 시도해 주세요.`,
      );
    }
  }

  async findAll(): Promise<FriendReq[]> {
    return this.friendReqModel.find().exec();
  }

  async updateFriendReq(
    updateFriendReqDto: UpdateFriendReqDto,
  ): Promise<FriendReq> {
    try {
      const { sender, receiver, status } = updateFriendReqDto;

      const friendReq = await this.friendReqModel.findOne({
        $or: [
          { sender: sender, receiver: receiver },
          { sender: receiver, receiver: sender },
        ],
      });

      if (!friendReq) {
        throw new NotFoundException('친구 요청이 존재하지 않습니다.');
      }

      friendReq.status = status;
      return await friendReq.save();
    } catch (error) {
      Logger.error(`updateFriendReq 실패: ${error.message}`);
      throw new Error(`친구 신청 업데이트 실패했습니다. 다시 시도해 주세요.`);
    }
  }

  async deleteFriendReq(id: string): Promise<FriendReq> {
    return this.friendReqModel.findByIdAndDelete(id).exec();
  }
}

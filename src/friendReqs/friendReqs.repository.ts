import { Injectable } from '@nestjs/common';
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

  // async createFriendReq(friendReq: Partial<FriendReq>): Promise<FriendReq> {
  //   const newFriendReq = new this.friendReqModel(friendReq);
  //   return newFriendReq.save();
  // }

  // async findFriendReqById(id: string): Promise<FriendReq> {
  //   return this.friendReqModel.findById(id).exec();
  // }

  // async findAll(): Promise<FriendReq[]> {
  //   return this.friendReqModel.find().exec();
  // }

  // async findOne(id: string): Promise<FriendReq> {
  //   return this.friendReqModel.findById(id).exec();
  // }

  // async updateFriendReq(
  //   id: string,
  //   updateFriendDto: UpdateFriendReqDto,
  // ): Promise<FriendReq> {
  //   return this.friendReqModel
  //     .findByIdAndUpdate(id, updateFriendDto, { new: true })
  //     .exec();
  // }

  // async delete(id: string): Promise<FriendReq> {
  //   return this.friendReqModel.findByIdAndRemove(id).exec();
  // }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFriendReqDto } from './dto/create-friendReq.dto';
import { UpdateFriendReqDto } from './dto/update-friendReq.dto';
import { FriendReqMongoRepository } from './friendReqs.repository';
import { FriendReq } from './schema/friendReq.schema';
import { NotiService } from 'src/noti/noti.service';
import { FriendsMongoRepository } from 'src/friends/friends.repository';
import { UserMongoRepository } from 'src/users/users.repository';
import { Types } from 'mongoose';

@Injectable()
export class FriendReqsService {
  constructor(
    private readonly friendReqMongoRepository: FriendReqMongoRepository,
    private readonly friendsMongoRepository: FriendsMongoRepository,
    private readonly userMongoRepository: UserMongoRepository,
    private readonly notiService: NotiService,
  ) {}

  async createFriendReq(
    createFriendDto: CreateFriendReqDto,
  ): Promise<FriendReq> {
    try {
      const receiverUser = await this.userMongoRepository.findByUsername(
        createFriendDto.receiver,
      );

      if (!receiverUser) {
        throw new NotFoundException('Other user not found');
      }

      const receiverId = new Types.ObjectId(receiverUser._id).toString();

      return await this.friendReqMongoRepository.createFriendReq({
        ...createFriendDto,
        receiver: receiverId,
      });
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create a friend request');
    }
  }

  async findByUserId(
    userId: Types.ObjectId,
  ): Promise<{ sent: FriendReq[]; received: FriendReq[] }> {
    return this.friendReqMongoRepository.findByUserId(userId);
  }

  findAll(): Promise<FriendReq[]> {
    return this.friendReqMongoRepository.findAll();
  }

  async updateFriendReq(
    updateFriendReqDto: UpdateFriendReqDto,
    currentUserId: Types.ObjectId,
  ): Promise<FriendReq> {
    const otherUsername =
      updateFriendReqDto.receiver || updateFriendReqDto.sender;

    const otherUser =
      await this.userMongoRepository.findByUsername(otherUsername);

    if (!otherUser) {
      throw new NotFoundException('Other user not found');
    }

    const otherUserId = new Types.ObjectId(otherUser._id);

    const { sent, received } =
      await this.friendReqMongoRepository.findByUserId(currentUserId);

    const existingReq = [...sent, ...received].find(
      (req) =>
        new Types.ObjectId(req.sender).equals(otherUserId) ||
        new Types.ObjectId(req.receiver).equals(otherUserId),
    );

    if (!existingReq) {
      throw new NotFoundException('Friend request not found');
    }

    if (existingReq.status !== updateFriendReqDto.status) {
      existingReq.status = updateFriendReqDto.status;

      const updatedFriendReqDto: UpdateFriendReqDto = {
        ...updateFriendReqDto,
        sender: existingReq.sender.toString(),
        receiver: existingReq.receiver.toString(),
      };
      const updatedFriendReq =
        await this.friendReqMongoRepository.updateFriendReq(
          updatedFriendReqDto,
        );

      // If the status of the friend request is '승낙', save the friend relationship in the friend DB.
      if (updateFriendReqDto.status === '승낙') {
        await this.friendsMongoRepository.addFriend(
          updatedFriendReq.sender,
          updatedFriendReq.receiver,
        );
      }

      return updatedFriendReq;
    } else {
      throw new Error('New status is the same as the current status');
    }
  }

  deleteFriendReq(id: Types.ObjectId): Promise<FriendReq> {
    return this.friendReqMongoRepository.deleteFriendReq(id);
  }
}

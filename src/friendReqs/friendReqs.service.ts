import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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

      const receiverId = receiverUser._id.toString();

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

    if (!otherUsername) {
      throw new BadRequestException('Receiver or sender must be provided');
    }

    const otherUser =
      await this.userMongoRepository.findByUsername(otherUsername);

    if (!otherUser) {
      throw new NotFoundException('Other user not found');
    }

    const otherUserId = otherUser._id.toString();

    const { sent, received } =
      await this.friendReqMongoRepository.findByUserId(currentUserId);

    const existingReq = [...sent, ...received].find(
      (req) =>
        (req.sender.toString() === currentUserId.toString() &&
          req.receiver.toString() === otherUserId) ||
        (req.receiver.toString() === currentUserId.toString() &&
          req.sender.toString() === otherUserId),
    );

    if (!existingReq) {
      throw new NotFoundException('Friend request not found');
    }

    if (existingReq.status !== updateFriendReqDto.status) {
      const updatedFriendReqDto: UpdateFriendReqDto = {
        ...updateFriendReqDto,
        sender: existingReq.sender.toString(),
        receiver: existingReq.receiver.toString(),
      };

      // if (updateFriendReqDto.status === '승낙') {
      //   await this.friendsMongoRepository.addFriend(
      //     new Types.ObjectId(updatedFriendReqDto.sender),
      //     new Types.ObjectId(updatedFriendReqDto.receiver),
      //   );
      // }

      return this.friendReqMongoRepository.updateFriendReq(updatedFriendReqDto);
    } else {
      throw new Error('New status is the same as the current status');
    }
  }

  deleteFriendReq(id: Types.ObjectId): Promise<FriendReq> {
    return this.friendReqMongoRepository.deleteFriendReq(id);
  }
}

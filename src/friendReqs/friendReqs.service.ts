import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateFriendReqDto } from './dto/create-friendReq.dto';
import { UpdateFriendReqDto } from './dto/update-friendReq.dto';
import { FriendReqMongoRepository } from './friendReqs.repository';
import { FriendReq } from './schema/friendReq.schema';
import { NotiGateway } from 'src/noti/noti.gateway';
import { FriendsMongoRepository } from 'src/friends/friends.repository';
import { UserMongoRepository } from 'src/users/users.repository';
import { Types } from 'mongoose';
import { NotiService } from 'src/noti/noti.service';

@Injectable()
export class FriendReqsService {
  constructor(
    private readonly friendReqMongoRepository: FriendReqMongoRepository,
    private readonly friendsMongoRepository: FriendsMongoRepository,
    private readonly userMongoRepository: UserMongoRepository,
    private readonly notiGateway: NotiGateway,
    private readonly notiService: NotiService,
  ) {}

  async createFriendReq(
    createFriendDto: CreateFriendReqDto,
  ): Promise<FriendReq> {
    const receiverUser = await this.userMongoRepository.findByUserId(
      createFriendDto.receiver,
    );

    if (!receiverUser) {
      throw new NotFoundException('Other user not found');
    }

    const newFriendReq = await this.friendReqMongoRepository.createFriendReq({
      ...createFriendDto,
      receiver: receiverUser._id.toString(),
    });

    const receiverSocketId = this.notiGateway.getUserSocketId(
      receiverUser._id.toString(),
    );
    try {
      if (receiverSocketId) {
        this.notiGateway.server.to(receiverSocketId).emit('friendRequest', {
          sender: createFriendDto.sender,
        });
      }
    } catch (error) {
      await this.notiService.create({
        senderId: createFriendDto.sender.toString(),
        receiverId: receiverUser._id.toString(),
        message: `${createFriendDto.sender}님이 친구 요청을 보냈어요.`,
        service: 'FriendRequests',
      });
    }

    return newFriendReq;
  }

  async findByUserId(
    userId: string,
  ): Promise<{ sent: FriendReq[]; received: FriendReq[] }> {
    return this.friendReqMongoRepository.findByUserId(userId);
  }

  findAll(): Promise<FriendReq[]> {
    return this.friendReqMongoRepository.findAll();
  }

  async updateFriendReq(
    updateFriendReqDto: UpdateFriendReqDto,
    currentUserId: string,
  ): Promise<FriendReq> {
    const otherUserId =
      updateFriendReqDto.receiver || updateFriendReqDto.sender;

    if (!otherUserId) {
      throw new BadRequestException('수신자 또는 발신자가 필요해요.');
    }

    const otherUser = await this.userMongoRepository.findByUserId(otherUserId);

    if (!otherUser) {
      throw new NotFoundException('유저를 찾을 수 없어요.');
    }

    const { sent, received } =
      await this.friendReqMongoRepository.findByUserId(currentUserId);

    const existingReq = [...sent, ...received].find(
      (req) =>
        (req.sender.toString() === currentUserId &&
          req.receiver.toString() === otherUser._id.toString()) ||
        (req.receiver.toString() === currentUserId &&
          req.sender.toString() === otherUser._id.toString()),
    );

    if (!existingReq) {
      throw new NotFoundException('친구 요청을 찾을 수 없어요.');
    }

    if (existingReq.status !== updateFriendReqDto.status) {
      if (updateFriendReqDto.status === '승낙') {
        await this.friendsMongoRepository.addFriend(
          existingReq.sender.toString(),
          existingReq.receiver.toString(),
        );
      }

      const updatedFriendReqDto: UpdateFriendReqDto = {
        ...updateFriendReqDto,
        sender: existingReq.sender.toString(),
        receiver: existingReq.receiver.toString(),
      };

      return this.friendReqMongoRepository.updateFriendReq(updatedFriendReqDto);
    } else {
      throw new Error('이전 신청과 동일해요. 다시 시도해 주세요.');
    }
  }

  deleteFriendReq(id: string): Promise<FriendReq> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('유저를 찾을 수 없어요.');
    }
    return this.friendReqMongoRepository.deleteFriendReq(id);
  }
}

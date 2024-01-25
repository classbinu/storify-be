import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFriendReqDto } from './dto/create-friendReq.dto';
import { UpdateFriendReqDto } from './dto/update-friendReq.dto';
import { FriendReqMongoRepository } from './friendReqs.repository';
// import FriendMongoRepository
import { FriendReq } from './schema/friendReq.schema';

@Injectable()
export class FriendReqsService {
  constructor(
    private readonly friendReqMongoRepository: FriendReqMongoRepository,
    // private readonly fri,
  ) {}

  // async createFriendReq(
  //   createFriendDto: CreateFriendReqDto,
  // ): Promise<FriendReq> {
  //   const createdFriendReq =
  //     await this.friendReqMongoRepository.createFriendReq(createFriendDto);
  //   if (createdFriendReq.status === 0) {
  //   }
  //   return createdFriendReq;
  // }

  // findAll(): Promise<FriendReq[]> {
  //   return this.friendReqMongoRepository.findAll();
  // }

  // findOne(id: string): Promise<FriendReq> {
  //   return this.friendReqMongoRepository.findOne(id);
  // }

  // async updateFriendReq(
  //   id: string,
  //   updateFriendDto: UpdateFriendReqDto,
  // ): Promise<FriendReq> {
  //   const friendReq = await this.friendReqMongoRepository.findOne(id);
  //   if (!friendReq) {
  //     throw new NotFoundException(`Friend request with id ${id} not found.`);
  //   }
  //   if (updateFriendDto.status === 1) {
  //     // Sender가 친구 요청을 취소하는 경우
  //     // 필요한 로직 추가. 예를 들어, receiver에게 알림 보내기 등
  //   } else if (updateFriendDto.status === 2) {
  //     // Receiver가 친구 요청을 거절하는 경우
  //     // 필요한 로직 추가. 예를 들어, sender에게 알림 보내기 등
  //   } else if (updateFriendDto.status === 3) {
  //     // Receiver가 친구 요청을 승낙하는 경우
  //     // Friend DB에 저장
  //     await this.friendReqMongoRepository.createFriendReq({ sender: friendReq.sender, receiver: friendReq.receiver });
  //   }

  //   return this.friendReqMongoRepository.updateFriendReq(id, updateFriendDto);
  // }
  // }

  // delete(id: string): Promise<FriendReq> {
  //   return this.friendReqMongoRepository.delete(id);
  // }
}

import { Test, TestingModule } from '@nestjs/testing';
import { FriendReqsService } from './friendReqs.service';

describe('FriendsService', () => {
  let service: FriendReqsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FriendReqsService],
    }).compile();

    service = module.get<FriendReqsService>(FriendReqsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { NotiGateway } from './noti.gateway';
import { NotiService } from './noti.service';

describe('NotiGateway', () => {
  let gateway: NotiGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotiGateway, NotiService],
    }).compile();

    gateway = module.get<NotiGateway>(NotiGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

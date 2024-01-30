import { Injectable } from '@nestjs/common';
import { CreateNotiDto } from './dto/create-noti.dto';
import { UpdateNotiDto } from './dto/update-noti.dto';

@Injectable()
export class NotiService {
  create(createNotiDto: CreateNotiDto) {
    return 'This action adds a new noti';
  }

  findAll() {
    return `This action returns all noti`;
  }

  findOne(id: number) {
    return `This action returns a #${id} noti`;
  }

  update(id: number, updateNotiDto: UpdateNotiDto) {
    return `This action updates a #${id} noti`;
  }

  remove(id: number) {
    return `This action removes a #${id} noti`;
  }
}

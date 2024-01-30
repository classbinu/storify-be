import { PartialType } from '@nestjs/mapped-types';
import { CreateNotiDto } from './create-noti.dto';

export class UpdateNotiDto extends PartialType(CreateNotiDto) {
  id: number;
}

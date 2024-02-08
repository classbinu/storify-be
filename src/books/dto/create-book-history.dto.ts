import { IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateBookHistoryDto {
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsNotEmpty()
  bookId: Types.ObjectId;

  @IsOptional()
  lastPage?: number;

  @IsOptional()
  rate?: number;

  @IsOptional()
  count?: number;
}

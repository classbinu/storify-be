import { PartialType } from '@nestjs/mapped-types';
import { CreateBookHistoryDto } from './create-book-history.dto';

export class UpdateBookDto extends PartialType(CreateBookHistoryDto) {}

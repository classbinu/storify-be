export class CreateNotiDto {
  readonly senderId: string;
  readonly receiverId: string;
  readonly message: string;
  readonly type: string;
  readonly service: string;
}

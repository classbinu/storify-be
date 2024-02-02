export class CreateNotiDto {
  senderId: string;
  receiverId: string;
  message: string;
  service: string;
  status?: string;
  createdAt?: Date;
}

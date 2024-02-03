import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Noti, NotiDocument } from './schema/noti.schema';
import { CreateNotiDto } from './dto/create-noti.dto';
import { NotiGateway } from './noti.gateway';

@Injectable()
export class NotiService {
  constructor(
    @InjectModel(Noti.name) private notiModel: Model<NotiDocument>,
    @Inject(forwardRef(() => NotiGateway))
    private readonly notiGateway: NotiGateway,
  ) {}

  async create(createNotiDto: CreateNotiDto): Promise<Noti> {
    const createdNoti = new this.notiModel(createNotiDto);
    return createdNoti.save();
  }

  async findMissedNotifications(userId: string): Promise<NotiDocument[]> {
    return this.notiModel.find({ receiverId: userId, status: 'unread' }).exec();
  }

  async markAsRead(notifications: NotiDocument[]): Promise<void> {
    for (const noti of notifications) {
      noti.status = 'read';
      noti.readAt = new Date();
      await noti.save();
    }
  }

  async sendMissedNotifications(userId: string) {
    const userSocketId = this.notiGateway.getUserSocketId(userId);
    if (userSocketId) {
      const missedNotifications = await this.findMissedNotifications(userId);
      this.notiGateway.server
        .to(userSocketId)
        .emit('missedNotifications', missedNotifications);
      await this.markAsRead(missedNotifications);
    }
  }

  async updateNotificationStatus(
    notiId: string,
    status: string,
  ): Promise<Noti> {
    return this.notiModel
      .findByIdAndUpdate(notiId, { status }, { new: true })
      .exec();
  }
}

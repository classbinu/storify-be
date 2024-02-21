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

  async findMissedNotifications(userObjectId: string): Promise<NotiDocument[]> {
    return this.notiModel
      .find({ receiverId: userObjectId, status: 'unread' })
      .exec();
  }

  async markAsRead(notifications: NotiDocument[]): Promise<void> {
    for (const noti of notifications) {
      noti.status = 'read';
      noti.readAt = new Date();
      await noti.save();
    }
  }

  async sendMissedNotifications(userObjectId: string): Promise<NotiDocument[]> {
    const missedNotifications =
      await this.findMissedNotifications(userObjectId);
    await this.markAsRead(missedNotifications);
    return missedNotifications;
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

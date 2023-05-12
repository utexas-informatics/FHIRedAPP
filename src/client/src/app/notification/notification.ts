import { App } from '../apps/app';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  broadcastTime: Date;
  isBroadcasted: boolean;
  broadcastedAt: Date;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  isDeleted: boolean;
  app?: App;
  meta: any;
}

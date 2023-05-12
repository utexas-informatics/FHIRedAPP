import { asyncData } from '../utils/test-utils';

import { NotificationService } from './notification.service';
import { User } from '../profile/user';
import { Notification } from '../notification/notification';

let httpClientSpy: {
  get: jasmine.Spy;
  put: jasmine.Spy;
};
let notificationService: NotificationService;
const notification: Notification = {
  _id: '5ff53d85af962933a8b3a555',
  title: 'title',
  message: 'message',
  broadcastTime: new Date(),
  isBroadcasted: true,
  broadcastedAt: new Date(),
  isDeleted: false,
  isActive: true,
  createdAt: new Date(),
  createdBy: 'user name',
  updatedAt: new Date(),
  updatedBy: 'user name',
};
const notificationId = notification._id;
const userId = '5ff40edee62fe27178eab165';

describe('notification.service', () => {
  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'put']);
    notificationService = new NotificationService(httpClientSpy as any);
  });

  it('should return expected notification collection', () => {
    const expectedNotifications: Notification[] = [{ ...notification }];
    httpClientSpy.get.and.returnValue(asyncData(expectedNotifications));
    notificationService.getNotifications(userId).subscribe((notifications) => {
      expect(notifications).toEqual(expectedNotifications);
    }, fail);
    expect(httpClientSpy.get.calls.count()).toBe(1, 'one call');
  });

  it('should return expected notification', () => {
    const expectedNotification: Notification = { ...notification };
    httpClientSpy.get.and.returnValue(asyncData(expectedNotification));
    notificationService.getNotification(notificationId).subscribe((data) => {
      expect(data).toEqual(expectedNotification);
    }, fail);
    expect(httpClientSpy.get.calls.count()).toBe(1, 'one call');
  });

  it('should mark notification as read', () => {
    const expectedUser: User = {
      _id: '5ff40edee62fe27178eab165',
      role: {
        _id: '5ff40cb84f294b73985e3dcc',
        role: 'Patient',
      },
      status: 'Active',
      firstName: 'first',
      lastName: 'last',
      email: 'a@b.com',
      zip: 123456,
      apps: [],
      notifications: [
        {
          notification,
          createdAt: new Date(),
          isPushed: true,
          isRead: true,
          readAt: new Date(),
        },
      ],
    };
    httpClientSpy.put.and.returnValue(asyncData(expectedUser));
    notificationService
      .markNotificationAsRead(userId, { notificationId })
      .subscribe((data) => {
        expect(data).toEqual(expectedUser);
      }, fail);
    expect(httpClientSpy.put.calls.count()).toBe(1, 'one call');
  });
});

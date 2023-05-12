import { asyncData } from '../utils/test-utils';
import { AppsService } from './apps.service';
import { App } from './app';
import { User } from '../profile/user';

let httpClientSpy: {
  get: jasmine.Spy;
  post: jasmine.Spy;
  put: jasmine.Spy;
  delete: jasmine.Spy;
};
let appsService: AppsService;
const app: App = {
  _id: '5ff53d85af962933a8b3a555',
  appName: 'appName',
  appLogo: 'https://url_to_app_logo_location',
  appUrl: 'https://url_to_app_url_location',
  longDescription: 'longDescription',
  shortDescription: 'shortDescription',
  consentVersion: '',
  consentTermOfUse: '',
  consentPrivacy: '',
  consentInformation: '',
  consentPolicy: '',
  isSSOEnabled: false,
  isDeleted: false,
  isActive: true,
  createdAt: new Date(),
  createdBy: 'user name',
  updatedAt: new Date(),
  updatedBy: 'user name',
  notifications: [],
  medicalRecords: [],
};
const appId = app._id;
const userId = '5ff40edee62fe27178eab165';

describe('app.service', () => {
  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', [
      'get',
      'post',
      'put',
      'delete',
    ]);
    appsService = new AppsService(httpClientSpy as any);
  });

  it('should return expected app collection', () => {
    const expectedApps: App[] = [{ ...app }];
    httpClientSpy.get.and.returnValue(asyncData(expectedApps));
    appsService.getApps().subscribe((apps) => {
      expect(apps).toEqual(expectedApps);
    }, fail);
    expect(httpClientSpy.get.calls.count()).toBe(1, 'one call');
  });

  it('should return expected app', () => {
    const expectedApp: App = { ...app };
    httpClientSpy.get.and.returnValue(asyncData(expectedApp));
    appsService.getApp(appId).subscribe((data) => {
      expect(data).toEqual(expectedApp);
    }, fail);
    expect(httpClientSpy.get.calls.count()).toBe(1, 'one call');
  });

  it('should update to accept consent for an app in user', () => {
    const expectedUser: User = {
      _id: '5ff40edee62fe27178eab165',
      status: 'Active',
      firstName: 'first',
      lastName: 'last',
      email: 'a@b.com',
      zip: 123456,
      role: {
        _id: '5ff40cb84f294b73985e3dcc',
        role: 'Patient',
      },
      apps: [
        {
          isActive: true,
          consentedMedicalRecords: [],
          _id: '12345',
          app: { ...app },
          consentUpdatedAt: new Date(),
        },
      ],
      notifications: [],
    };
    const requestPayload = { appId: app._id };
    httpClientSpy.put.and.returnValue(asyncData(expectedUser));
    appsService.acceptConsent(userId, requestPayload).subscribe((user) => {
      expect(user.apps[0].app._id).toEqual(expectedUser.apps[0].app._id);
    }, fail);
    expect(httpClientSpy.put.calls.count()).toBe(1, 'one call');
  });

  it('should update to revoke consent for an app in user', () => {
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
      apps: [
        {
          isActive: false,
          consentedMedicalRecords: [],
          _id: '12345',
          app: { ...app },
          consentUpdatedAt: new Date(),
        },
      ],
      notifications: [],
    };
    const requestPayload = { appId: app._id };
    httpClientSpy.put.and.returnValue(asyncData(expectedUser));
    appsService.revokeConsent(userId, requestPayload).subscribe((user) => {
      expect(user.apps[0].app._id).toEqual(expectedUser.apps[0].app._id);
    }, fail);
    expect(httpClientSpy.put.calls.count()).toBe(1, 'one call');
  });
});

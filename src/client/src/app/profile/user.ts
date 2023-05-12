import { App } from '../apps/app';
import { MedicalRecord } from '../apps/app';
import { Notification } from '../notification/notification';

interface Role {
  _id: string;
  role: string;
}

interface Apps {
  isActive: boolean;
  consentedMedicalRecords: MedicalRecord[];
  _id: string;
  app: App;
  consentUpdatedAt: Date;
}

interface Notifications {
  isPushed: boolean;
  isRead: boolean;
  notification?: string | Notification;
  createdAt: Date;
  readAt: Date;
}

export interface User {
  datavantMatchStatus: string;
  _id: string;
  lastLoginTime: Date;
  status: string;
  role: Role;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  genderOther?: string;
  birthday: Date;
  phoneNumberPrimary: string;
  phoneNumberSecondary: string;
  zip: number;
  apps: Apps[];
  notifications: Notifications[];
  pushToken?: string;
  isBiometricEnabled?:boolean
  fhirPatientID?: string; // this will not be coming from DB. IT will be set from Patient Search API
}

export interface NewUser {
  email: string;
}
export interface VerifyUser {
  status: string;
  userExists:boolean
}




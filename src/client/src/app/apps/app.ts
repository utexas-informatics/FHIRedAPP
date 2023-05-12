import { Notification } from '../notification/notification';

export interface MedicalRecord {
  type: string;
}

export interface App {
  _id: string;
  appName: string;
  appLogo: string;
  appUrl: string;
  longDescription: string;
  shortDescription: string;
  consentVersion: string;
  consentTermOfUse: string;
  consentPrivacy: string;
  consentInformation: string;
  consentPolicy_sp: string;
  consentPolicy_en: string;
  isSSOEnabled: boolean;
  isDeleted: boolean;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  notifications: Notification[];
  medicalRecords: MedicalRecord[];
  app?: App;
  selected?: boolean;
  isConsented?: boolean;
}

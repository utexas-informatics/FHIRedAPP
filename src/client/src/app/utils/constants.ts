import { environment } from '../../environments/environment';

export const { apiBaseUrl, apiAssetsBaseUrl } = environment;

export interface ApiUrlConfig {
  users: string;
  getUserByEmailId: string;
  getUserByEVC: string;
  apps: string;
  notifications: string;
  getInviteCodeStatus: string;
  getLeapConsentPolicy: string;
  verifyEmailVerificationCode: string;
  inviteCodes: string;
  clinicalDataByCategory: string;
  verifyUser: string;
  getFhirPatientId: string;
  messages: string;
  logout: string;
  forgotPassword: string;
  generateAudit: string;
  declineAppConsent: string;
  getBiometricAccessToken: string;
  loginWithMagicLink: string;
  getTokenByHashkey: string;
  getAppRedirectionUrl:string;
}

export const apiUrlConfig: ApiUrlConfig = {
  users: `${apiBaseUrl}/users`,
  inviteCodes: `${apiBaseUrl}/inviteCodes`,
  getUserByEmailId: `${apiBaseUrl}/users/byEmailId`,
  getUserByEVC: `${apiBaseUrl}/users/byEVC`,
  apps: `${apiBaseUrl}/apps`,
  notifications: `${apiBaseUrl}/notifications`,
  getInviteCodeStatus: `${apiBaseUrl}/inviteCodes/getStatus`,
  getLeapConsentPolicy: `${apiBaseUrl}/metadata/getLeapConsentPolicy`,
  verifyEmailVerificationCode: `${apiBaseUrl}/emailVerificationCodes/verify`,
  verifyUser: `${apiBaseUrl}/users/verify`,
  getFhirPatientId: `${apiBaseUrl}/users/getFhirPatientId`,
  clinicalDataByCategory: `${apiBaseUrl}/clinicalData/`,
  messages: `${apiBaseUrl}/messages/`,
  logout: `${apiBaseUrl}/users/logout`,
  forgotPassword: `${apiBaseUrl}/users/forgot`,
  generateAudit: `${apiBaseUrl}/audit/generateAudit`,
  declineAppConsent: `${apiBaseUrl}/inviteCodes/declineAppConsent`,
  getBiometricAccessToken: `${apiBaseUrl}/users/getBiometricAccessToken`,
  loginWithMagicLink: `${apiBaseUrl}/users/magicLink`,
  getTokenByHashkey: `${apiBaseUrl}/users/getTokensFromHashkey`,
  getAppRedirectionUrl: `${apiBaseUrl}/apps/getAppRedirectionUrl`,
};

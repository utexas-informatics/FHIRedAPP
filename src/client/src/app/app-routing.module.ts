import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth-guard.service';

const routes: Routes = [
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  {
    path: 'welcome',
    loadChildren: () =>
      import('./welcome/welcome.module').then((m) => m.WelcomePageModule),
  },
  {
    path: 'invite',
    loadChildren: () =>
      import('./invite/invite.module').then((m) => m.InvitePageModule),
  },
  {
    path: 'consent',
    loadChildren: () =>
      import('./consent/consent.module').then((m) => m.ConsentPageModule),
  },
  {
    path: 'loginSignup',
    loadChildren: () =>
      import('./login-signup/login-signup.module').then(
        (m) => m.LoginSignupPageModule
      ),
  },
  {
    path: 'loginOptions',
    loadChildren: () =>
      import('./login-options/login-options.module').then(
        (m) => m.LoginOptionsPageModule
      ),
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./tabs/tabs.module').then((m) => m.TabsPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'records',
    loadChildren: () =>
      import('./records/records.module').then((m) => m.RecordsPageModule),
  },
  {
    path: 'loginPassword',
    loadChildren: () =>
      import('./login-password/login-password.module').then(
        (m) => m.LoginPasswordPageModule
      ),
  },
  {
    path: 'signupPassword',
    loadChildren: () =>
      import('./signup-password/signup-password.module').then(
        (m) => m.SignupPasswordPageModule
      ),
  },
  {
    path: 'emailVerification',
    loadChildren: () =>
      import('./email-verification/email-verification.module').then(
        (m) => m.EmailVerificationPageModule
      ),
  },
  {
    path: 'signupActivate',
    loadChildren: () =>
      import('./signup-activate/signup-activate.module').then(
        (m) => m.SignupActivatePageModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./profile/profile.module').then((m) => m.ProfilePageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'my-records',
    loadChildren: () =>
      import('./my-records/my-records.module').then(
        (m) => m.MyRecordsPageModule
      ),
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      relativeLinkResolution: 'legacy',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}

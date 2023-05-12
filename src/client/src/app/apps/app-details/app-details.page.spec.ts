import 'zone.js/dist/zone-testing'; // zone-testing needs to be first import!
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { IonicModule } from '@ionic/angular';
import { AppDetailsPage } from './app-details.page';

describe('AppDetailsPage', () => {
  let component: AppDetailsPage;
  let fixture: ComponentFixture<AppDetailsPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.resetTestEnvironment();
      TestBed.initTestEnvironment(
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting()
      );

      TestBed.configureTestingModule({
        declarations: [AppDetailsPage],
        imports: [IonicModule.forRoot(), RouterTestingModule, HttpClientModule],
        providers: [InAppBrowser],
        schemas: [NO_ERRORS_SCHEMA],
      }).compileComponents();

      fixture = TestBed.createComponent(AppDetailsPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

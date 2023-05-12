import 'zone.js/dist/zone-testing'; // zone-testing needs to be first import!
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyAppsPage } from './my-apps.page';

describe('MyAppsPage', () => {
  let component: MyAppsPage;
  let fixture: ComponentFixture<MyAppsPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.resetTestEnvironment();
      TestBed.initTestEnvironment(
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting()
      );

      TestBed.configureTestingModule({
        declarations: [MyAppsPage],
        imports: [IonicModule.forRoot(), RouterTestingModule, HttpClientModule],
        schemas: [NO_ERRORS_SCHEMA],
      }).compileComponents();

      fixture = TestBed.createComponent(MyAppsPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

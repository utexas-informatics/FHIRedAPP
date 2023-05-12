import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { AppService } from '../app.service';
import { SafeHtmlPipe } from '../utils/safe-html.pipe';

import { ConsentPage } from './consent.page';

describe('ConsentPage', () => {
  let component: ConsentPage;
  let fixture: ComponentFixture<ConsentPage>;
  class FakeAppService {
    getLeapConsentPolicy() {
      of('some string');
    }
  }
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ConsentPage, SafeHtmlPipe],
        imports: [IonicModule.forRoot(), RouterTestingModule, HttpClientModule],
        providers: [{ AppService, useClass: FakeAppService }],
        schemas: [NO_ERRORS_SCHEMA],
      }).compileComponents();

      fixture = TestBed.createComponent(ConsentPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsentPage);
    fixture.detectChanges();
    fixture.debugElement.injector.get(ConsentPage);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

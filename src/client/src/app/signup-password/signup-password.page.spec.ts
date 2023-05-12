import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';

import { SignupPasswordPage } from './signup-password.page';

describe('SignupPasswordPage', () => {
  let component: SignupPasswordPage;
  let fixture: ComponentFixture<SignupPasswordPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SignupPasswordPage],
        imports: [IonicModule.forRoot(), RouterTestingModule, HttpClientModule],
      }).compileComponents();

      fixture = TestBed.createComponent(SignupPasswordPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

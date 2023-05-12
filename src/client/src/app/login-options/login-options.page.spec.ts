import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';

import { LoginOptionsPage } from './login-options.page';

describe('LoginOptionsPage', () => {
  let component: LoginOptionsPage;
  let fixture: ComponentFixture<LoginOptionsPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [LoginOptionsPage],
        imports: [IonicModule.forRoot(), RouterTestingModule, HttpClientModule],
      }).compileComponents();

      fixture = TestBed.createComponent(LoginOptionsPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';

import { SignupActivatePage } from './signup-activate.page';
import { UserService } from '../profile/user.service';

describe('SignupActivatePage', () => {
  let component: SignupActivatePage;
  let fixture: ComponentFixture<SignupActivatePage>;
  class FakeUserService {
    getUserByEmailId(param) {
      of('some string');
    }
  }
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SignupActivatePage],
        imports: [IonicModule.forRoot(), RouterTestingModule, HttpClientModule],
        providers: [{ UserService, useClass: FakeUserService }],
      }).compileComponents();

      fixture = TestBed.createComponent(SignupActivatePage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupActivatePage);
    fixture.detectChanges();
    fixture.debugElement.injector.get(SignupActivatePage);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';

import { LoginOptionsModalComponent } from './login-options-modal.component';

describe('LoginOptionsModalComponent', () => {
  let component: LoginOptionsModalComponent;
  let fixture: ComponentFixture<LoginOptionsModalComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [LoginOptionsModalComponent],
        imports: [IonicModule.forRoot(), RouterTestingModule, HttpClientModule],
      }).compileComponents();

      fixture = TestBed.createComponent(LoginOptionsModalComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyRecordsCategoryListItemComponentComponent } from './my-records-category-item.component';

describe('MyRecordsListComponentComponent', () => {
  let component: MyRecordsCategoryListItemComponentComponent;
  let fixture: ComponentFixture<MyRecordsCategoryListItemComponentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MyRecordsCategoryListItemComponentComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyRecordsCategoryListItemComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

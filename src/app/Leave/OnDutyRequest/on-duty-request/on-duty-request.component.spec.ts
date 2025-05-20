import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnDutyRequestComponent } from './on-duty-request.component';

describe('OnDutyRequestComponent', () => {
  let component: OnDutyRequestComponent;
  let fixture: ComponentFixture<OnDutyRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnDutyRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnDutyRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

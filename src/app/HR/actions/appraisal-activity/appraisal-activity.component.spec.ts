import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppraisalActivityComponent } from './appraisal-activity.component';

describe('AppraisalActivityComponent', () => {
  let component: AppraisalActivityComponent;
  let fixture: ComponentFixture<AppraisalActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppraisalActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppraisalActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

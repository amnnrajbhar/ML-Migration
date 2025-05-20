import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppraisalInitialdetailComponent } from './appraisal-initialdetail.component';

describe('AppraisalInitialdetailComponent', () => {
  let component: AppraisalInitialdetailComponent;
  let fixture: ComponentFixture<AppraisalInitialdetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppraisalInitialdetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppraisalInitialdetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

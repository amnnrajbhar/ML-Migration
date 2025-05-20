import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppraisalworkflowPendingtasksComponent } from './appraisalworkflow-pendingtasks.component';

describe('AppraisalworkflowPendingtasksComponent', () => {
  let component: AppraisalworkflowPendingtasksComponent;
  let fixture: ComponentFixture<AppraisalworkflowPendingtasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppraisalworkflowPendingtasksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppraisalworkflowPendingtasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

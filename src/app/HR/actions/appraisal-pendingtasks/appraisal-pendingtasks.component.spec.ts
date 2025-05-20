import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppraisalPendingtasksComponent } from './appraisal-pendingtasks.component';

describe('AppraisalPendingtasksComponent', () => {
  let component: AppraisalPendingtasksComponent;
  let fixture: ComponentFixture<AppraisalPendingtasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppraisalPendingtasksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppraisalPendingtasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppraisalPrintComponent } from './appraisal-print.component';

describe('AppraisalPrintComponent', () => {
  let component: AppraisalPrintComponent;
  let fixture: ComponentFixture<AppraisalPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppraisalPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppraisalPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

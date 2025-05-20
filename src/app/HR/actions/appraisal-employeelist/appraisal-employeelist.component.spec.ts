import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppraisalEmployeelistComponent } from './appraisal-employeelist.component';

describe('AppraisalEmployeelistComponent', () => {
  let component: AppraisalEmployeelistComponent;
  let fixture: ComponentFixture<AppraisalEmployeelistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppraisalEmployeelistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppraisalEmployeelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

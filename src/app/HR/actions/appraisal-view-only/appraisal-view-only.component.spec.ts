import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppraisalViewOnlyComponent } from './appraisal-view-only.component';

describe('AppraisalViewOnlyComponent', () => {
  let component: AppraisalViewOnlyComponent;
  let fixture: ComponentFixture<AppraisalViewOnlyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppraisalViewOnlyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppraisalViewOnlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

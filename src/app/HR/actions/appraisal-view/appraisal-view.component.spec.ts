import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppraisalViewComponent } from './appraisal-view.component';

describe('AppraisalViewComponent', () => {
  let component: AppraisalViewComponent;
  let fixture: ComponentFixture<AppraisalViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppraisalViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppraisalViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

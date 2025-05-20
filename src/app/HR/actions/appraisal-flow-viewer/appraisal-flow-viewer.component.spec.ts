import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppraisalFlowViewerComponent } from './appraisal-flow-viewer.component';

describe('AppraisalFlowViewerComponent', () => {
  let component: AppraisalFlowViewerComponent;
  let fixture: ComponentFixture<AppraisalFlowViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppraisalFlowViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppraisalFlowViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

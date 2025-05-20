import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowapproverMasterComponent } from './workflowapprover-master.component';

describe('WorkflowapproverMasterComponent', () => {
  let component: WorkflowapproverMasterComponent;
  let fixture: ComponentFixture<WorkflowapproverMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowapproverMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowapproverMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

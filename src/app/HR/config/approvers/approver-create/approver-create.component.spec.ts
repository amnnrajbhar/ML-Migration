import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproverCreateComponent } from './approver-create.component';

describe('ApproverCreateComponent', () => {
  let component: ApproverCreateComponent;
  let fixture: ComponentFixture<ApproverCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproverCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproverCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

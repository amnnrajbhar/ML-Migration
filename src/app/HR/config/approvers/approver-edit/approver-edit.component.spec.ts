import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproverEditComponent } from './approver-edit.component';

describe('ApproverEditComponent', () => {
  let component: ApproverEditComponent;
  let fixture: ComponentFixture<ApproverEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproverEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproverEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

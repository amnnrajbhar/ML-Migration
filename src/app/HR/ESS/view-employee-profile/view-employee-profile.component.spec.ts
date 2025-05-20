import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEmployeeProfileComponent } from './view-employee-profile.component';

describe('ViewEmployeeProfileComponent', () => {
  let component: ViewEmployeeProfileComponent;
  let fixture: ComponentFixture<ViewEmployeeProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewEmployeeProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewEmployeeProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

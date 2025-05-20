import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalarystructureMasterComponent } from './salarystructure-master.component';

describe('SalarystructureMasterComponent', () => {
  let component: SalarystructureMasterComponent;
  let fixture: ComponentFixture<SalarystructureMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalarystructureMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalarystructureMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

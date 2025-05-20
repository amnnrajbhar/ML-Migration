import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadonlyemployeeSalaryComponent } from './readonlyemployee-salary.component';

describe('ReadonlyemployeeSalaryComponent', () => {
  let component: ReadonlyemployeeSalaryComponent;
  let fixture: ComponentFixture<ReadonlyemployeeSalaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReadonlyemployeeSalaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadonlyemployeeSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

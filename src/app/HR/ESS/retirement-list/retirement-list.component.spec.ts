import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RetirementListComponent } from './retirement-list.component';

describe('RetirementListComponent', () => {
  let component: RetirementListComponent;
  let fixture: ComponentFixture<RetirementListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RetirementListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetirementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

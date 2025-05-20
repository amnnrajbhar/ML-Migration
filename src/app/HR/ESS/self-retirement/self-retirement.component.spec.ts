import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelfRetirementComponent } from './self-retirement.component';

describe('SelfRetirementComponent', () => {
  let component: SelfRetirementComponent;
  let fixture: ComponentFixture<SelfRetirementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelfRetirementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelfRetirementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

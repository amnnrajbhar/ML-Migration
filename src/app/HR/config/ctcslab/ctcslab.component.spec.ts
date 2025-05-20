import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CtcslabComponent } from './ctcslab.component';

describe('CtcslabComponent', () => {
  let component: CtcslabComponent;
  let fixture: ComponentFixture<CtcslabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CtcslabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CtcslabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

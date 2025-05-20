import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CtcformulaComponent } from './ctcformula.component';

describe('CtcformulaComponent', () => {
  let component: CtcformulaComponent;
  let fixture: ComponentFixture<CtcformulaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CtcformulaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CtcformulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

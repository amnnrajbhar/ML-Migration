import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationPrintComponent } from './confirmation-print.component';

describe('ConfirmationPrintComponent', () => {
  let component: ConfirmationPrintComponent;
  let fixture: ComponentFixture<ConfirmationPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmationPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

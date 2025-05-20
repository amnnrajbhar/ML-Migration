import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkConfirmationComponent } from './bulk-confirmation.component';

describe('BulkConfirmationComponent', () => {
  let component: BulkConfirmationComponent;
  let fixture: ComponentFixture<BulkConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

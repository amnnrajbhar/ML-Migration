import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmTransferJoiningComponent } from './confirm-transfer-joining.component';

describe('ConfirmTransferJoiningComponent', () => {
  let component: ConfirmTransferJoiningComponent;
  let fixture: ComponentFixture<ConfirmTransferJoiningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmTransferJoiningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmTransferJoiningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

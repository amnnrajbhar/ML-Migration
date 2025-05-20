import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ITTicketComponent } from './itticket.component';

describe('ITTicketComponent', () => {
  let component: ITTicketComponent;
  let fixture: ComponentFixture<ITTicketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ITTicketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ITTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

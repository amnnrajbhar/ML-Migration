import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InitiateFnfComponent } from './initiate-fnf.component';

describe('InitiateFnfComponent', () => {
  let component: InitiateFnfComponent;
  let fixture: ComponentFixture<InitiateFnfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InitiateFnfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InitiateFnfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatoryComponent } from './signatory.component';

describe('SignatoryComponent', () => {
  let component: SignatoryComponent;
  let fixture: ComponentFixture<SignatoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignatoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignatoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

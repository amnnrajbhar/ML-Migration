import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoEmailToCandidateConfigComponent } from './no-email-to-candidate-config.component';

describe('NoEmailToCandidateConfigComponent', () => {
  let component: NoEmailToCandidateConfigComponent;
  let fixture: ComponentFixture<NoEmailToCandidateConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoEmailToCandidateConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoEmailToCandidateConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

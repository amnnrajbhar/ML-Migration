import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppraisalInitialreviewlistComponent } from './appraisal-initialreviewlist.component';

describe('AppraisalInitialreviewlistComponent', () => {
  let component: AppraisalInitialreviewlistComponent;
  let fixture: ComponentFixture<AppraisalInitialreviewlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppraisalInitialreviewlistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppraisalInitialreviewlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

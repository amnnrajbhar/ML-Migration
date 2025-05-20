import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppraisalHodRecommendationsComponent } from './appraisal-hod-recommendations.component';

describe('AppraisalHodRecommendationsComponent', () => {
  let component: AppraisalHodRecommendationsComponent;
  let fixture: ComponentFixture<AppraisalHodRecommendationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppraisalHodRecommendationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppraisalHodRecommendationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

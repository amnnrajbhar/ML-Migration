import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkAppraisalComponent } from './bulk-appraisal.component';

describe('BulkAppraisalComponent', () => {
  let component: BulkAppraisalComponent;
  let fixture: ComponentFixture<BulkAppraisalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkAppraisalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkAppraisalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

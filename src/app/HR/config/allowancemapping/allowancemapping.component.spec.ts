import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllowancemappingComponent } from './allowancemapping.component';

describe('AllowancemappingComponent', () => {
  let component: AllowancemappingComponent;
  let fixture: ComponentFixture<AllowancemappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllowancemappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllowancemappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

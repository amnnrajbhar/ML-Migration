import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResignationPrintComponent } from './resignation-print.component';

describe('ResignationPrintComponent', () => {
  let component: ResignationPrintComponent;
  let fixture: ComponentFixture<ResignationPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResignationPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResignationPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

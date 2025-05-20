import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefineBudgetEditComponent } from './define-budget-edit.component';

describe('DefineBudgetEditComponent', () => {
  let component: DefineBudgetEditComponent;
  let fixture: ComponentFixture<DefineBudgetEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefineBudgetEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefineBudgetEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

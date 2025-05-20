import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefineBudgetCreateComponent } from './define-budget-create.component';

describe('DefineBudgetCreateComponent', () => {
  let component: DefineBudgetCreateComponent;
  let fixture: ComponentFixture<DefineBudgetCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefineBudgetCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefineBudgetCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

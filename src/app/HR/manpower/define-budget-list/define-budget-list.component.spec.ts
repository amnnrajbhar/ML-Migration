import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefineBudgetListComponent } from './define-budget-list.component';

describe('DefineBudgetListComponent', () => {
  let component: DefineBudgetListComponent;
  let fixture: ComponentFixture<DefineBudgetListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefineBudgetListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefineBudgetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

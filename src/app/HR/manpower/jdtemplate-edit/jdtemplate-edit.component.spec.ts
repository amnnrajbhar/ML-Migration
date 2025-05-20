import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JdtemplateEditComponent } from './jdtemplate-edit.component';

describe('JdtemplateEditComponent', () => {
  let component: JdtemplateEditComponent;
  let fixture: ComponentFixture<JdtemplateEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JdtemplateEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JdtemplateEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

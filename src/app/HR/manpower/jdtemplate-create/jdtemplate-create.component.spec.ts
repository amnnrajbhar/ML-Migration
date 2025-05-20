import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JdtemplateCreateComponent } from './jdtemplate-create.component';

describe('JdtemplateCreateComponent', () => {
  let component: JdtemplateCreateComponent;
  let fixture: ComponentFixture<JdtemplateCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JdtemplateCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JdtemplateCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

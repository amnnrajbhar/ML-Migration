import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JdtemplateListComponent } from './jdtemplate-list.component';

describe('JdtemplateListComponent', () => {
  let component: JdtemplateListComponent;
  let fixture: ComponentFixture<JdtemplateListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JdtemplateListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JdtemplateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

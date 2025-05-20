import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterMappingConfigComponent } from './letter-mapping-config.component';

describe('LetterMappingConfigComponent', () => {
  let component: LetterMappingConfigComponent;
  let fixture: ComponentFixture<LetterMappingConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LetterMappingConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LetterMappingConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

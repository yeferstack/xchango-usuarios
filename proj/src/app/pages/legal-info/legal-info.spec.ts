import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalInfo } from './legal-info';

describe('LegalInfo', () => {
  let component: LegalInfo;
  let fixture: ComponentFixture<LegalInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalInfo],
    }).compileComponents();

    fixture = TestBed.createComponent(LegalInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

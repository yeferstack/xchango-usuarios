import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartBarras } from './chart-barras';

describe('ChartBarras', () => {
  let component: ChartBarras;
  let fixture: ComponentFixture<ChartBarras>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartBarras],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartBarras);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

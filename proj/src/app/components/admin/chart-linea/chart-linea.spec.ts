import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartLinea } from './chart-linea';

describe('ChartLinea', () => {
  let component: ChartLinea;
  let fixture: ComponentFixture<ChartLinea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartLinea],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartLinea);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

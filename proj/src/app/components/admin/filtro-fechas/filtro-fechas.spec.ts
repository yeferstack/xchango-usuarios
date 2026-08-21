import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltroFechas } from './filtro-fechas';

describe('FiltroFechas', () => {
  let component: FiltroFechas;
  let fixture: ComponentFixture<FiltroFechas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltroFechas],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltroFechas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartDona } from './chart-dona';

describe('ChartDona', () => {
  let component: ChartDona;
  let fixture: ComponentFixture<ChartDona>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartDona],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartDona);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

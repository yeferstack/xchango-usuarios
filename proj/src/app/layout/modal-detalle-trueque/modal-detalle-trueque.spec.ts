import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDetalleTruequeComponent } from './modal-detalle-trueque';

describe('ModalDetalleTrueque', () => {
  let component: ModalDetalleTruequeComponent;
  let fixture: ComponentFixture<ModalDetalleTruequeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalDetalleTruequeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalDetalleTruequeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioEditarTruequeComponent } from './formulario-editar-trueque';

describe('FormularioEditarTruequeComponent', () => {
  let component: FormularioEditarTruequeComponent;
  let fixture: ComponentFixture<FormularioEditarTruequeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioEditarTruequeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioEditarTruequeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
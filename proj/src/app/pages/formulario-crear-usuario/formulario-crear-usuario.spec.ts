import { ComponentFixture, TestBed } from '@angular/core/testing';
import { formulario_crear_usuarioComponent } from './formulario-crear-usuario';

describe('formulario_crear_usuarioComponent', () => {
  let component: formulario_crear_usuarioComponent;
  let fixture: ComponentFixture<formulario_crear_usuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [formulario_crear_usuarioComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(formulario_crear_usuarioComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
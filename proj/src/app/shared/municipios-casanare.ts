/**
 * Catálogo único de municipios de Casanare.
 *
 * XchanGo opera exclusivamente en este departamento, por lo que la lista es fija
 * y no necesita ser un JSON. Antes estaba duplicada en `pages/ubicacion` y en
 * `pages/formulario-crear-trueques`; ambos deben importarla desde aquí.
 */
export const DEPARTAMENTO = 'Casanare';

export const MUNICIPIOS_CASANARE: readonly string[] = [
  'Yopal',
  'Aguazul',
  'Chámeza',
  'Hato Corozal',
  'La Salina',
  'Maní',
  'Monterrey',
  'Nunchía',
  'Orocué',
  'Paz de Ariporo',
  'Pore',
  'Recetor',
  'Sabanalarga',
  'Sácama',
  'San Luis de Palenque',
  'Támara',
  'Tauramena',
  'Trinidad',
  'Villanueva',
] as const;

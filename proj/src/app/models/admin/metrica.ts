/**
 * Modelos de métricas (data/metricas.json).
 *
 * Fuente ÚNICA: `MetricasAdminService` ya no redeclara estas interfaces, las
 * importa desde aquí.
 */

/** Totales actuales. Son coherentes con el resto de los JSON. */
export interface MetricasResumen {
  usuarios: number;
  usuariosActivos: number;
  publicaciones: number;
  intercambios: number;
  publicacionesReportadas: number;
  usuariosSuspendidos: number;
}

/** Alias histórico; algunos componentes lo importaban con este nombre. */
export type Metrica = MetricasResumen;

/** Punto de una serie de gráfica. `valor` es una magnitud, nunca dinero. */
export interface SerieGrafico {
  label: string;
  valor: number;
}

export interface Comparativa {
  actual: number;
  anterior: number;
  porcentaje: number;
}

export interface MetricasData {
  resumen: MetricasResumen;
  comparativas: Record<string, Comparativa>;
  actividadMensual: SerieGrafico[];
  intercambiosPorMes: SerieGrafico[];
  publicacionesPorCategoria: SerieGrafico[];
  actividadPorUbicacion: SerieGrafico[];
  crecimientoCategorias: SerieGrafico[];
}

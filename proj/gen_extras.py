# -*- coding: utf-8 -*-
"""Cierra los vacíos detectados al cruzar HU01-HU77 contra la base estática."""
import json, os, collections

D = "./src/app/data"
def leer(n): return json.load(open(os.path.join(D, n), encoding="utf-8"))
def guardar(n, d):
    with open(os.path.join(D, n), "w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, indent=2); f.write("\n")

usuarios      = leer("usuarios.json")
publicaciones = leer("publicaciones.json")
trueques      = leer("trueques.json")

# ---------------------------------------------------------------------------
# HU01-HU03, HU15-HU17: estado de verificación de cuenta.
# HU02, HU06, HU10, HU24-HU26: contraseña (texto plano, solo para la demo).
# HU21: descripción y número de contacto en el perfil.
# HU53: calificación tras un trueque completado.
# ---------------------------------------------------------------------------
PERFIL = {
    "u1":  ("verificado",    "Carlos123*",   "Cambio tecnología y bicicletas. Respondo rápido por WhatsApp."),
    "u2":  ("verificado",    "Daniela123*",  "Profesora de inglés. Intercambio clases por diseño o servicios."),
    "u3":  ("no_verificado", "Andres123*",   "Interesado en electrónica y accesorios."),
    "u4":  ("verificado",    "Valentina123*","Diseñadora gráfica. Ofrezco identidad de marca por servicios o equipos."),
    "u5":  ("verificado",    "Jhon123*",     "Técnico en sistemas. Hago mantenimiento a cambio de otros servicios."),
    "u6":  ("verificado",    "Camila123*",   "Toco guitarra y doy clases. Busco ropa y accesorios."),
    "u7":  ("no_verificado", "Sebastian123*","Nuevo en XchanGo, explorando la plataforma."),
    "u8":  ("verificado",    "Paola123*",    "Intercambio ropa en buen estado y calzado deportivo."),
    "u9":  ("no_verificado", "Ricardo123*",  "Perfil con reportes pendientes de revisión."),
    "u10": ("verificado",    "Luisa123*",    "Contadora. Ofrezco asesoría a cambio de clases o servicios."),
    "u11": ("verificado",    "Oscar123*",    "Trabajo en jardinería y mantenimiento de zonas verdes."),
    "u12": ("verificado",    "Natalia123*",  "Comparto recursos digitales y muebles de hogar."),
    "u13": ("verificado",    "Julian123*",   "Busco muebles para mi apartamento. Ofrezco comedor y electrodomésticos."),
    "u14": ("no_verificado", "Marcela123*",  "Cuenta con advertencia activa."),
    "u15": ("verificado",    "Diego123*",    "Edito video. Intercambio ediciones por plantillas o cursos."),
}

for u in usuarios:
    estado_ver, password, descripcion = PERFIL[u["id"]]
    u["password"] = password                 # texto plano: base de datos estática de práctica
    u["verificacion"] = estado_ver           # HU03/HU16: 'no_verificado' | 'verificado'
    u["descripcion"] = descripcion           # HU21
    u["calificacion"] = 0.0                  # HU53, se calcula abajo
    u["totalCalificaciones"] = 0

# ---------------------------------------------------------------------------
# HU32: fecha de última modificación de la publicación.
# ---------------------------------------------------------------------------
MODIFICADAS = {"pub1": "2026-08-16", "pub4": "2026-08-13", "pub6": "2026-08-05", "pub9": "2026-08-10"}
for p in publicaciones:
    p["fechaModificacion"] = MODIFICADAS.get(p["id"], p["fechaCreacion"])

# ---------------------------------------------------------------------------
# HU51-HU53: confirmación por ambas partes y calificación del trueque.
# ---------------------------------------------------------------------------
CALIF = {
    "tr1":  (5, 5), "tr3":  (4, 5), "tr5":  (5, 4),
    "tr10": (4, 4), "tr12": (5, 5),
}
for t in trueques:
    completado = t["estado"] == "completado"
    t["confirmadoSolicitante"] = completado
    t["confirmadoPropietario"] = completado
    cs, cp = CALIF.get(t["id"], (None, None))
    # Calificación que DA el solicitante y que DA el propietario.
    t["calificacionSolicitante"] = cs
    t["calificacionPropietario"] = cp

# La calificación del usuario es un promedio derivado, no un dato duplicado.
recibidas = collections.defaultdict(list)
for t in trueques:
    if t["calificacionSolicitante"] is not None:
        recibidas[t["propietarioId"]].append(t["calificacionSolicitante"])
    if t["calificacionPropietario"] is not None:
        recibidas[t["solicitanteId"]].append(t["calificacionPropietario"])

for u in usuarios:
    notas = recibidas.get(u["id"], [])
    u["totalCalificaciones"] = len(notas)
    u["calificacion"] = round(sum(notas) / len(notas), 1) if notas else 0.0

# ---------------------------------------------------------------------------
# HU44, HU46, HU47, HU53, HU54, HU58, HU59: avisos dirigidos al USUARIO.
# `alertas.json` es del panel admin y no tiene usuarioId, por eso no sirve aquí.
# NO es mensajería: no hay hilo, ni respuesta, ni conversación almacenada.
# ---------------------------------------------------------------------------
notificaciones = [
    {"id": "not1", "usuarioId": "u12", "tipo": "solicitud",     "referenciaId": "tr7",
     "titulo": "Nueva solicitud de trueque",
     "mensaje": "Julián Ospina quiere truequear por tu publicación \"Juego de sala de 3 puestos\".",
     "leida": False, "fecha": "2026-08-18T10:12:00"},
    {"id": "not2", "usuarioId": "u2",  "tipo": "solicitud",     "referenciaId": "tr8",
     "titulo": "Nueva solicitud de trueque",
     "mensaje": "Luisa Cárdenas quiere truequear por tu publicación \"Clases de inglés personalizadas\".",
     "leida": False, "fecha": "2026-08-19T09:05:00"},
    {"id": "not3", "usuarioId": "u5",  "tipo": "solicitud",     "referenciaId": "tr9",
     "titulo": "Nueva solicitud de trueque",
     "mensaje": "Óscar Peña quiere truequear por tu publicación \"Reparación de computadores\".",
     "leida": False, "fecha": "2026-08-19T14:40:00"},
    {"id": "not4", "usuarioId": "u2",  "tipo": "aceptada",      "referenciaId": "tr6",
     "titulo": "Tu solicitud fue aceptada",
     "mensaje": "Valentina Ríos aceptó tu propuesta. Continúa la negociación por WhatsApp.",
     "leida": True,  "fecha": "2026-08-14T16:30:00"},
    {"id": "not5", "usuarioId": "u12", "tipo": "rechazada",     "referenciaId": "tr2",
     "titulo": "Tu solicitud fue rechazada",
     "mensaje": "Carlos Ospina rechazó tu propuesta por \"Bicicleta todoterreno rin 29\".",
     "leida": True,  "fecha": "2026-08-01T11:20:00"},
    {"id": "not6", "usuarioId": "u1",  "tipo": "completada",    "referenciaId": "tr10",
     "titulo": "Trueque completado",
     "mensaje": "El trueque con Diego Salamanca quedó cerrado. Ya puedes calificar la experiencia.",
     "leida": False, "fecha": "2026-08-18T18:00:00"},
    {"id": "not7", "usuarioId": "u4",  "tipo": "recordatorio",  "referenciaId": "tr6",
     "titulo": "Tienes una solicitud sin responder",
     "mensaje": "La propuesta de Daniela Torres lleva varios días esperando tu respuesta.",
     "leida": False, "fecha": "2026-08-19T08:00:00"},
    {"id": "not8", "usuarioId": "u12", "tipo": "recordatorio",  "referenciaId": "pub6",
     "titulo": "Publicación pausada hace tiempo",
     "mensaje": "\"Juego de sala de 3 puestos\" lleva pausada varios días. Actívala para recibir propuestas.",
     "leida": False, "fecha": "2026-08-19T08:00:00"},
    {"id": "not9", "usuarioId": "u7",  "tipo": "verificacion",  "referenciaId": None,
     "titulo": "Verifica tu cuenta",
     "mensaje": "Tu cuenta sigue sin verificar. Confirma tu correo para poder publicar.",
     "leida": False, "fecha": "2026-08-15T07:30:00"},
    {"id": "not10", "usuarioId": "u14", "tipo": "moderacion",   "referenciaId": "pub13",
     "titulo": "Publicación retirada",
     "mensaje": "Tu publicación fue retirada por contenido inapropiado. Revisa las normas de la comunidad.",
     "leida": True,  "fecha": "2026-08-02T09:45:00"},
]

guardar("usuarios.json", usuarios)
guardar("publicaciones.json", publicaciones)
guardar("trueques.json", trueques)
guardar("notificaciones.json", notificaciones)

print("Campos agregados:")
print("  usuarios      -> password, verificacion, descripcion, calificacion, totalCalificaciones")
print("  publicaciones -> fechaModificacion")
print("  trueques      -> confirmadoSolicitante, confirmadoPropietario, calificacion x2")
print(f"  notificaciones.json creado con {len(notificaciones)} registros")
print("\nVerificados:", sum(1 for u in usuarios if u["verificacion"] == "verificado"), "/", len(usuarios))
print("Calificaciones:", {u["id"]: u["calificacion"] for u in usuarios if u["totalCalificaciones"]})

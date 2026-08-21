# -*- coding: utf-8 -*-
"""Genera la base de datos estatica de XchanGo con integridad referencial exacta."""
import json, os, collections

OUT = "./src/app/data"
os.makedirs(OUT, exist_ok=True)

def guardar(nombre, datos):
    ruta = os.path.join(OUT, nombre)
    with open(ruta, "w", encoding="utf-8") as f:
        json.dump(datos, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"  {nombre}")

# ---------------------------------------------------------------- CATEGORIAS
categorias = [
    {"id": "cat1", "nombre": "Electrónicos",           "icono": "phone"},
    {"id": "cat2", "nombre": "Vehículos",              "icono": "car"},
    {"id": "cat3", "nombre": "Ropa y accesorios",      "icono": "shirt"},
    {"id": "cat4", "nombre": "Hogar y muebles",        "icono": "home"},
    {"id": "cat5", "nombre": "Deportes",               "icono": "bike"},
    {"id": "cat6", "nombre": "Videojuegos",            "icono": "gamepad"},
    {"id": "cat7", "nombre": "Servicios profesionales","icono": "tools"},
    {"id": "cat8", "nombre": "Recursos digitales",     "icono": "book"},
]

# ---------------------------------------------------------------- ADMINS
admins = [
    {"id": "a1", "nombre": "Miguel Admin", "email": "admin@xchango.com",
     "password": "admin123", "rol": "admin", "estado": "activo",
     "avatar": "/img/admin/avatar-admin.jpg", "ultimoAcceso": "2026-08-18T09:12:00"},
    {"id": "a2", "nombre": "Ana Moderadora", "email": "moderador@xchango.com",
     "password": "mod123", "rol": "moderador", "estado": "activo",
     "avatar": "/img/admin/avatar-moderadora.jpg", "ultimoAcceso": "2026-08-17T18:40:00"},
]

# ---------------------------------------------------------------- USUARIOS
# Se conservan los 15 usuarios originales. Se agrega telefono (WhatsApp) y avatar.
# Los contadores publicaciones/intercambios/reportes se calculan al final.
_usuarios_base = [
    ("u1",  "Carlos Ospina",     "carlos.ospina@mail.com",     "activo",     "2026-01-14", "Yopal",          "alto",  "3143025871", 12),
    ("u2",  "Daniela Torres",    "daniela.torres@mail.com",    "activo",     "2026-02-03", "Aguazul",        "alto",  "3125540912", 33),
    ("u3",  "Andrés Molina",     "andres.molina@mail.com",     "suspendido", "2026-02-21", "Yopal",          "bajo",  "3208814476", 15),
    ("u4",  "Valentina Ríos",    "valentina.rios@mail.com",    "activo",     "2026-03-08", "Villanueva",     "alto",  "3116729305", 47),
    ("u5",  "Jhon Barrera",      "jhon.barrera@mail.com",      "advertido",  "2026-03-19", "Tauramena",      "medio", "3182203648", 51),
    ("u6",  "Camila Sanabria",   "camila.sanabria@mail.com",   "activo",     "2026-04-02", "Yopal",          "medio", "3007719284", 22),
    ("u7",  "Sebastián Nieto",   "sebastian.nieto@mail.com",   "activo",     "2026-04-27", "Monterrey",      "bajo",  "3193348017", 60),
    ("u8",  "Paola Guzmán",      "paola.guzman@mail.com",      "activo",     "2026-05-11", "Yopal",          "alto",  "3156604733", 29),
    ("u9",  "Ricardo Fonseca",   "ricardo.fonseca@mail.com",   "suspendido", "2026-05-23", "Aguazul",        "bajo",  "3134417950", 53),
    ("u10", "Luisa Cárdenas",    "luisa.cardenas@mail.com",    "activo",     "2026-06-05", "Maní",           "medio", "3172286104", 44),
    ("u11", "Óscar Peña",        "oscar.pena@mail.com",        "activo",     "2026-06-18", "Paz de Ariporo", "medio", "3109935627", 8),
    ("u12", "Natalia Suárez",    "natalia.suarez@mail.com",    "activo",     "2026-07-01", "Yopal",          "alto",  "3145572380", 26),
    ("u13", "Julián Ospina",     "julian.ospina@mail.com",     "activo",     "2026-07-14", "Villanueva",     "medio", "3163308291", 9),
    ("u14", "Marcela Vega",      "marcela.vega@mail.com",      "advertido",  "2026-07-26", "Yopal",          "bajo",  "3021146758", 41),
    ("u15", "Diego Salamanca",   "diego.salamanca@mail.com",   "activo",     "2026-08-04", "Aguazul",        "bajo",  "3187760413", 4),
]
usuarios = [
    {"id": i, "nombre": n, "email": e, "telefono": tel, "estado": est,
     "fechaRegistro": fr, "ubicacion": ub, "nivelActividad": na,
     "avatar": f"https://i.pravatar.cc/80?img={av}",
     "publicaciones": 0, "intercambios": 0, "reportes": 0}
    for (i, n, e, est, fr, ub, na, tel, av) in _usuarios_base
]

# ---------------------------------------------------------------- PUBLICACIONES
# Campos condicionales por tipo:
#   bien_fisico  -> municipio + barrio + cantidadDisponible + disponibilidad
#   servicio     -> municipio + cantidadDisponible + disponibilidad  (SIN barrio)
#   bien_digital -> ninguno de los anteriores
IMG = "https://images.unsplash.com/photo-{}?w=600&q=80"
publicaciones = [
    {
        "id": "pub1", "usuarioId": "u1", "tipo": "bien_fisico", "categoriaId": "cat1",
        "titulo": "iPhone 13 de 128 GB",
        "descripcion": "Celular en excelente estado, con caja y cargador original. Batería al 89 %.",
        "ofreces": "iPhone 13 de 128 GB",
        "buscas": "Consola de videojuegos o portátil",
        "municipio": "Yopal", "barrio": "El Triunfo",
        "cantidadDisponible": "1 unidad", "disponibilidad": "Fines de semana",
        "imagenes": [IMG.format("1632661674596-df8be070a5c5")],
        "estado": "activa", "vistas": 214, "fechaCreacion": "2026-08-12",
    },
    {
        "id": "pub2", "usuarioId": "u1", "tipo": "bien_fisico", "categoriaId": "cat5",
        "titulo": "Bicicleta todoterreno rin 29",
        "descripcion": "Bicicleta de montaña con 21 cambios, frenos de disco y llantas nuevas.",
        "ofreces": "Bicicleta todoterreno rin 29",
        "buscas": "PlayStation 5 o Nintendo Switch",
        "municipio": "Yopal", "barrio": "La Campiña",
        "cantidadDisponible": "1 unidad", "disponibilidad": "Lunes a viernes en la tarde",
        "imagenes": [IMG.format("1485965120184-e220f721d03e")],
        "estado": "finalizada", "vistas": 341, "fechaCreacion": "2026-07-28",
    },
    {
        "id": "pub3", "usuarioId": "u1", "tipo": "bien_digital", "categoriaId": "cat8",
        "titulo": "Plantillas premium para Canva",
        "descripcion": "Paquete de 40 plantillas editables para redes sociales y presentaciones.",
        "ofreces": "Paquete de plantillas premium para Canva",
        "buscas": "Diseño de logo o edición de video",
        "imagenes": [IMG.format("1626785774573-4b799315345d")],
        "estado": "activa", "vistas": 128, "fechaCreacion": "2026-08-15",
    },
    {
        "id": "pub4", "usuarioId": "u4", "tipo": "bien_fisico", "categoriaId": "cat6",
        "titulo": "PlayStation 5 con dos controles",
        "descripcion": "Consola con dos controles inalámbricos y tres juegos físicos incluidos.",
        "ofreces": "PlayStation 5 con dos controles",
        "buscas": "Portátil para diseño o cámara réflex",
        "municipio": "Villanueva", "barrio": "Centro",
        "cantidadDisponible": "1 unidad", "disponibilidad": "Disponible todos los días",
        "imagenes": [IMG.format("1587202372634-32705e3bf49c")],
        "estado": "activa", "vistas": 487, "fechaCreacion": "2026-08-09",
    },
    {
        "id": "pub5", "usuarioId": "u4", "tipo": "servicio", "categoriaId": "cat7",
        "titulo": "Diseño de logo e identidad de marca",
        "descripcion": "Diseño de logotipo, paleta de colores y manual básico de marca.",
        "ofreces": "Diseño de logo e identidad de marca",
        "buscas": "Clases de inglés o asesoría contable",
        "municipio": "Villanueva",
        "cantidadDisponible": "3 sesiones", "disponibilidad": "Martes y jueves de 5:00 PM a 8:00 PM",
        "imagenes": [IMG.format("1626785774573-4b799315345d")],
        "estado": "activa", "vistas": 176, "fechaCreacion": "2026-08-11",
    },
    {
        "id": "pub6", "usuarioId": "u12", "tipo": "bien_fisico", "categoriaId": "cat4",
        "titulo": "Juego de sala de 3 puestos",
        "descripcion": "Sofá de tres puestos en tela, sin roturas ni manchas. Se entrega desarmado.",
        "ofreces": "Juego de sala de 3 puestos",
        "buscas": "Comedor de 4 puestos o nevera pequeña",
        "municipio": "Yopal", "barrio": "Los Helechos",
        "cantidadDisponible": "1 unidad", "disponibilidad": "Fines de semana",
        "imagenes": [IMG.format("1493663284031-b7e3aefcae8e")],
        "estado": "pausada", "vistas": 95, "fechaCreacion": "2026-08-02",
    },
    {
        "id": "pub7", "usuarioId": "u12", "tipo": "bien_digital", "categoriaId": "cat8",
        "titulo": "Curso digital de Excel básico",
        "descripcion": "Curso en video de 12 lecciones con archivos de práctica y certificado.",
        "ofreces": "Curso digital de Excel básico",
        "buscas": "Curso de inglés o plantillas de diseño",
        "imagenes": [IMG.format("1516321318423-f06f85e504b3")],
        "estado": "activa", "vistas": 263, "fechaCreacion": "2026-08-14",
    },
    {
        "id": "pub8", "usuarioId": "u8", "tipo": "bien_fisico", "categoriaId": "cat3",
        "titulo": "Chaqueta de cuero talla M",
        "descripcion": "Chaqueta de cuero genuino, usada dos veces, sin desgaste.",
        "ofreces": "Chaqueta de cuero talla M",
        "buscas": "Zapatillas deportivas talla 40 o audífonos",
        "municipio": "Yopal", "barrio": "El Centro",
        "cantidadDisponible": "1 unidad", "disponibilidad": "Fines de semana",
        "imagenes": [IMG.format("1521572163474-6864f9cf17ab")],
        "estado": "finalizada", "vistas": 152, "fechaCreacion": "2026-07-19",
    },
    {
        "id": "pub9", "usuarioId": "u2", "tipo": "servicio", "categoriaId": "cat7",
        "titulo": "Clases de inglés personalizadas",
        "descripcion": "Clases uno a uno enfocadas en conversación, desde nivel básico hasta intermedio.",
        "ofreces": "Clases de inglés personalizadas",
        "buscas": "Diseño de logo o reparación de computador",
        "municipio": "Aguazul",
        "cantidadDisponible": "5 sesiones", "disponibilidad": "Lunes y miércoles de 4:00 PM a 7:00 PM",
        "imagenes": [IMG.format("1516321318423-f06f85e504b3")],
        "estado": "activa", "vistas": 198, "fechaCreacion": "2026-08-06",
    },
    {
        "id": "pub10", "usuarioId": "u5", "tipo": "servicio", "categoriaId": "cat7",
        "titulo": "Reparación de computadores",
        "descripcion": "Mantenimiento preventivo, cambio de pasta térmica e instalación de sistema operativo.",
        "ofreces": "Reparación y mantenimiento de computadores",
        "buscas": "Clases de guitarra o trabajos de jardinería",
        "municipio": "Tauramena",
        "cantidadDisponible": "4 horas", "disponibilidad": "Sábados de 8:00 AM a 12:00 M",
        "imagenes": [IMG.format("1498050108023-c5249f4df085")],
        "estado": "activa", "vistas": 143, "fechaCreacion": "2026-08-08",
    },
    # --- Publicaciones retiradas por moderación (referenciadas por publicaciones-eliminadas) ---
    {
        "id": "pub11", "usuarioId": "u9", "tipo": "bien_fisico", "categoriaId": "cat4",
        "titulo": "Licores artesanales hechos en casa",
        "descripcion": "Publicación retirada por incumplir las normas de la comunidad.",
        "ofreces": "Licores artesanales hechos en casa",
        "buscas": "Electrodomésticos pequeños",
        "municipio": "Aguazul", "barrio": "San Agustín",
        "cantidadDisponible": "6 unidades", "disponibilidad": "Fines de semana",
        "imagenes": [],
        "estado": "eliminada", "vistas": 61, "fechaCreacion": "2026-08-04",
    },
    {
        "id": "pub12", "usuarioId": "u3", "tipo": "bien_digital", "categoriaId": "cat8",
        "titulo": "Cuenta de streaming compartida",
        "descripcion": "Publicación retirada por incumplir las normas de la comunidad.",
        "ofreces": "Acceso a cuenta de streaming compartida",
        "buscas": "Licencia de software o curso digital",
        "imagenes": [],
        "estado": "eliminada", "vistas": 88, "fechaCreacion": "2026-08-01",
    },
    {
        "id": "pub13", "usuarioId": "u14", "tipo": "bien_fisico", "categoriaId": "cat1",
        "titulo": "Documentos de trámite personal",
        "descripcion": "Publicación retirada por incumplir las normas de la comunidad.",
        "ofreces": "Gestión de documentos de trámite personal",
        "buscas": "Recargas o accesorios de celular",
        "municipio": "Yopal", "barrio": "Villa Rosa",
        "cantidadDisponible": "2 unidades", "disponibilidad": "Entre semana",
        "imagenes": [],
        "estado": "eliminada", "vistas": 37, "fechaCreacion": "2026-07-25",
    },
]

# ---------------------------------------------------------------- TRUEQUES
trueques = [
    {"id": "tr1",  "solicitanteId": "u4",  "propietarioId": "u1",  "publicacionId": "pub2",
     "ofrece": "PlayStation 5 con dos controles", "busca": "Bicicleta todoterreno rin 29",
     "estado": "completado", "fechaSolicitud": "2026-07-30", "fechaCierre": "2026-08-03"},
    {"id": "tr2",  "solicitanteId": "u12", "propietarioId": "u1",  "publicacionId": "pub2",
     "ofrece": "Juego de sala de 3 puestos", "busca": "Bicicleta todoterreno rin 29",
     "estado": "rechazado", "fechaSolicitud": "2026-07-31", "fechaCierre": "2026-08-01"},
    {"id": "tr3",  "solicitanteId": "u6",  "propietarioId": "u8",  "publicacionId": "pub8",
     "ofrece": "Clases de guitarra", "busca": "Chaqueta de cuero talla M",
     "estado": "completado", "fechaSolicitud": "2026-07-22", "fechaCierre": "2026-07-27"},
    {"id": "tr4",  "solicitanteId": "u1",  "propietarioId": "u4",  "publicacionId": "pub4",
     "ofrece": "iPhone 13 de 128 GB", "busca": "PlayStation 5 con dos controles",
     "estado": "aceptado", "fechaSolicitud": "2026-08-16", "fechaCierre": None},
    {"id": "tr5",  "solicitanteId": "u1",  "propietarioId": "u12", "publicacionId": "pub7",
     "ofrece": "Paquete de plantillas premium para Canva", "busca": "Curso digital de Excel básico",
     "estado": "completado", "fechaSolicitud": "2026-08-15", "fechaCierre": "2026-08-16"},
    {"id": "tr6",  "solicitanteId": "u2",  "propietarioId": "u4",  "publicacionId": "pub5",
     "ofrece": "Clases de inglés personalizadas", "busca": "Diseño de logo e identidad de marca",
     "estado": "aceptado", "fechaSolicitud": "2026-08-13", "fechaCierre": None},
    {"id": "tr7",  "solicitanteId": "u13", "propietarioId": "u12", "publicacionId": "pub6",
     "ofrece": "Comedor de 4 puestos", "busca": "Juego de sala de 3 puestos",
     "estado": "pendiente", "fechaSolicitud": "2026-08-18", "fechaCierre": None},
    {"id": "tr8",  "solicitanteId": "u10", "propietarioId": "u2",  "publicacionId": "pub9",
     "ofrece": "Asesoría contable básica", "busca": "Clases de inglés personalizadas",
     "estado": "pendiente", "fechaSolicitud": "2026-08-19", "fechaCierre": None},
    {"id": "tr9",  "solicitanteId": "u11", "propietarioId": "u5",  "publicacionId": "pub10",
     "ofrece": "Trabajos de jardinería", "busca": "Reparación y mantenimiento de computadores",
     "estado": "pendiente", "fechaSolicitud": "2026-08-19", "fechaCierre": None},
    {"id": "tr10", "solicitanteId": "u15", "propietarioId": "u1",  "publicacionId": "pub3",
     "ofrece": "Edición de video corto", "busca": "Paquete de plantillas premium para Canva",
     "estado": "completado", "fechaSolicitud": "2026-08-17", "fechaCierre": "2026-08-18"},
    {"id": "tr11", "solicitanteId": "u7",  "propietarioId": "u4",  "publicacionId": "pub4",
     "ofrece": "Balón de baloncesto oficial", "busca": "PlayStation 5 con dos controles",
     "estado": "rechazado", "fechaSolicitud": "2026-08-12", "fechaCierre": "2026-08-13"},
    {"id": "tr12", "solicitanteId": "u8",  "propietarioId": "u12", "publicacionId": "pub7",
     "ofrece": "Zapatillas deportivas talla 40", "busca": "Curso digital de Excel básico",
     "estado": "completado", "fechaSolicitud": "2026-08-10", "fechaCierre": "2026-08-12"},
]

# ---------------------------------------------------------------- REPORTES
# publicaciones-reportadas.json: SOLO datos del reporte + claves foraneas.
reportes = [
    {"id": "rep1",  "publicacionId": "pub11", "reportanteId": "u7",  "motivo": "Producto no permitido",       "fecha": "2026-08-05", "estado": "eliminada",  "gravedad": "alta"},
    {"id": "rep2",  "publicacionId": "pub11", "reportanteId": "u10", "motivo": "Posible estafa",              "fecha": "2026-08-06", "estado": "pendiente",  "gravedad": "alta"},
    {"id": "rep3",  "publicacionId": "pub11", "reportanteId": "u13", "motivo": "Información engañosa",        "fecha": "2026-08-07", "estado": "pendiente",  "gravedad": "alta"},
    {"id": "rep4",  "publicacionId": "pub12", "reportanteId": "u15", "motivo": "Servicio no permitido",       "fecha": "2026-08-02", "estado": "eliminada",  "gravedad": "alta"},
    {"id": "rep5",  "publicacionId": "pub12", "reportanteId": "u11", "motivo": "Contenido inapropiado",       "fecha": "2026-08-03", "estado": "pendiente",  "gravedad": "alta"},
    {"id": "rep6",  "publicacionId": "pub13", "reportanteId": "u2",  "motivo": "Contenido inapropiado",       "fecha": "2026-07-26", "estado": "eliminada",  "gravedad": "media"},
    {"id": "rep7",  "publicacionId": "pub10", "reportanteId": "u4",  "motivo": "Información engañosa",        "fecha": "2026-08-16", "estado": "aprobada",   "gravedad": "media"},
    {"id": "rep8",  "publicacionId": "pub6",  "reportanteId": "u5",  "motivo": "Categoría incorrecta",        "fecha": "2026-08-12", "estado": "aprobada",   "gravedad": "baja"},
    {"id": "rep9",  "publicacionId": "pub9",  "reportanteId": "u14", "motivo": "Datos de contacto externos",  "fecha": "2026-08-17", "estado": "pendiente",  "gravedad": "media"},
    {"id": "rep10", "publicacionId": "pub1",  "reportanteId": "u3",  "motivo": "Descripción no corresponde",  "fecha": "2026-08-18", "estado": "pendiente",  "gravedad": "baja"},
]

# ---------------------------------------------------------------- ELIMINADAS
eliminadas = [
    {"id": "el1", "publicacionId": "pub11", "usuarioId": "u9",  "adminId": "a1",
     "motivo": "Producto no permitido",  "fecha": "2026-08-10"},
    {"id": "el2", "publicacionId": "pub12", "usuarioId": "u3",  "adminId": "a2",
     "motivo": "Servicio no permitido",  "fecha": "2026-08-08"},
    {"id": "el3", "publicacionId": "pub13", "usuarioId": "u14", "adminId": "a2",
     "motivo": "Contenido inapropiado",  "fecha": "2026-08-02"},
]

# ---------------------------------------------------------------- HISTORIAL
historial = [
    {"id": "ac1", "usuarioId": "u9",  "adminId": "a1", "accion": "Suspensión",
     "descripcion": "Cuenta suspendida por reportes reiterados.", "fecha": "2026-08-17T16:20:00"},
    {"id": "ac2", "usuarioId": "u5",  "adminId": "a2", "accion": "Advertencia",
     "descripcion": "Advertencia enviada por información engañosa en una publicación.", "fecha": "2026-08-16T11:05:00"},
    {"id": "ac3", "usuarioId": "u14", "adminId": "a2", "accion": "Eliminación",
     "descripcion": "Publicación eliminada por contenido inapropiado.", "fecha": "2026-08-02T09:40:00"},
    {"id": "ac4", "usuarioId": "u12", "adminId": "a2", "accion": "Aprobación",
     "descripcion": "Reporte revisado y descartado.", "fecha": "2026-08-12T15:10:00"},
    {"id": "ac5", "usuarioId": "u14", "adminId": "a1", "accion": "Advertencia",
     "descripcion": "Advertencia por publicar contenido no permitido.", "fecha": "2026-07-27T08:55:00"},
    {"id": "ac6", "usuarioId": "u3",  "adminId": "a1", "accion": "Suspensión",
     "descripcion": "Cuenta suspendida tras acumular reportes.", "fecha": "2026-08-09T17:30:00"},
    {"id": "ac7", "usuarioId": "u9",  "adminId": "a1", "accion": "Eliminación",
     "descripcion": "Publicación eliminada por producto no permitido.", "fecha": "2026-08-10T14:02:00"},
    {"id": "ac8", "usuarioId": "u3",  "adminId": "a2", "accion": "Eliminación",
     "descripcion": "Publicación eliminada por servicio no permitido.", "fecha": "2026-08-08T10:48:00"},
]

# ---------------------------------------------------------------- ALERTAS
alertas = [
    {"id": "al1", "tipo": "sospechosa", "titulo": "Actividad inusual detectada",
     "mensaje": "El usuario Ricardo Fonseca creó 5 publicaciones en menos de 10 minutos.",
     "fecha": "2026-08-18T08:45:00", "leida": False, "prioridad": "alta"},
    {"id": "al2", "tipo": "moderacion", "titulo": "Publicaciones pendientes de revisión",
     "mensaje": "Hay reportes de publicaciones esperando revisión.",
     "fecha": "2026-08-18T07:30:00", "leida": False, "prioridad": "media"},
    {"id": "al3", "tipo": "usuario", "titulo": "Usuario con múltiples reportes",
     "mensaje": "Ricardo Fonseca acumula varios reportes en los últimos 30 días.",
     "fecha": "2026-08-17T20:15:00", "leida": False, "prioridad": "alta"},
    {"id": "al4", "tipo": "sistema", "titulo": "Respaldo completado",
     "mensaje": "La copia de seguridad diaria finalizó correctamente.",
     "fecha": "2026-08-17T02:00:00", "leida": True, "prioridad": "baja"},
    {"id": "al5", "tipo": "sospechosa", "titulo": "Intentos de acceso fallidos",
     "mensaje": "Se registraron 12 intentos fallidos de inicio de sesión desde la misma IP.",
     "fecha": "2026-08-16T23:18:00", "leida": False, "prioridad": "media"},
    {"id": "al6", "tipo": "moderacion", "titulo": "Categoría con aumento de reportes",
     "mensaje": "La categoría Electrónicos duplicó sus reportes esta semana.",
     "fecha": "2026-08-16T10:05:00", "leida": True, "prioridad": "baja"},
]

# ---------------------------------------------------------------- CONTADORES REALES
pub_por_usuario = collections.Counter(p["usuarioId"] for p in publicaciones)

int_por_usuario = collections.Counter()
for t in trueques:
    if t["estado"] == "completado":
        int_por_usuario[t["solicitanteId"]] += 1
        int_por_usuario[t["propietarioId"]] += 1

dueno = {p["id"]: p["usuarioId"] for p in publicaciones}
rep_por_usuario = collections.Counter(dueno[r["publicacionId"]] for r in reportes)

for u in usuarios:
    u["publicaciones"] = pub_por_usuario.get(u["id"], 0)
    u["intercambios"] = int_por_usuario.get(u["id"], 0)
    u["reportes"] = rep_por_usuario.get(u["id"], 0)

# ---------------------------------------------------------------- METRICAS
nombre_cat = {c["id"]: c["nombre"] for c in categorias}
activas = [p for p in publicaciones if p["estado"] != "eliminada"]

metricas = {
    # Totales EXACTOS, derivados de los demas JSON.
    "resumen": {
        "usuarios": len(usuarios),
        "usuariosActivos": sum(1 for u in usuarios if u["estado"] == "activo"),
        "publicaciones": len(activas),
        "intercambios": sum(1 for t in trueques if t["estado"] == "completado"),
        "publicacionesReportadas": sum(1 for r in reportes if r["estado"] == "pendiente"),
        "usuariosSuspendidos": sum(1 for u in usuarios if u["estado"] == "suspendido"),
    },
    # Series historicas SIMULADAS: solo alimentan las graficas del panel.
    "actividadMensual": [
        {"label": "Ene", "valor": 120}, {"label": "Feb", "valor": 168},
        {"label": "Mar", "valor": 210}, {"label": "Abr", "valor": 195},
        {"label": "May", "valor": 260}, {"label": "Jun", "valor": 310},
        {"label": "Jul", "valor": 355}, {"label": "Ago", "valor": 412},
    ],
    "intercambiosPorMes": [
        {"label": "Ene", "valor": 42},  {"label": "Feb", "valor": 58},
        {"label": "Mar", "valor": 71},  {"label": "Abr", "valor": 65},
        {"label": "May", "valor": 88},  {"label": "Jun", "valor": 104},
        {"label": "Jul", "valor": 121}, {"label": "Ago", "valor": 139},
    ],
    # Etiquetas alineadas con categorias.json (catalogo unico).
    "publicacionesPorCategoria": [
        {"label": nombre_cat["cat1"], "valor": 342},
        {"label": nombre_cat["cat3"], "valor": 218},
        {"label": nombre_cat["cat4"], "valor": 176},
        {"label": nombre_cat["cat2"], "valor": 143},
        {"label": nombre_cat["cat6"], "valor": 128},
        {"label": nombre_cat["cat7"], "valor": 112},
        {"label": nombre_cat["cat5"], "valor": 96},
        {"label": nombre_cat["cat8"], "valor": 74},
    ],
    "actividadPorUbicacion": [
        {"label": "Yopal", "valor": 486}, {"label": "Aguazul", "valor": 194},
        {"label": "Villanueva", "valor": 132}, {"label": "Tauramena", "valor": 108},
        {"label": "Monterrey", "valor": 87}, {"label": "Maní", "valor": 64},
        {"label": "Paz de Ariporo", "valor": 51},
    ],
    "comparativas": {
        "usuarios":       {"actual": 412, "anterior": 355, "porcentaje": 16.1},
        "publicaciones":  {"actual": 186, "anterior": 164, "porcentaje": 13.4},
        "intercambios":   {"actual": 139, "anterior": 121, "porcentaje": 14.9},
        "usuariosNuevos": {"actual": 57,  "anterior": 45,  "porcentaje": 26.7},
        "reportes":       {"actual": 12,  "anterior": 17,  "porcentaje": -29.4},
    },
    "crecimientoCategorias": [
        {"label": nombre_cat["cat6"], "valor": 34},
        {"label": nombre_cat["cat1"], "valor": 21},
        {"label": nombre_cat["cat8"], "valor": 19},
        {"label": nombre_cat["cat4"], "valor": 18},
        {"label": nombre_cat["cat7"], "valor": 12},
        {"label": nombre_cat["cat3"], "valor": 9},
        {"label": nombre_cat["cat5"], "valor": 6},
        {"label": nombre_cat["cat2"], "valor": -4},
    ],
}

print("Escribiendo JSON:")
guardar("admins.json", admins)
guardar("usuarios.json", usuarios)
guardar("categorias.json", categorias)
guardar("publicaciones.json", publicaciones)
guardar("trueques.json", trueques)
guardar("alertas.json", alertas)
guardar("historial-acciones.json", historial)
guardar("publicaciones-reportadas.json", reportes)
guardar("publicaciones-eliminadas.json", eliminadas)
guardar("metricas.json", metricas)
print("\nResumen calculado:", json.dumps(metricas["resumen"], ensure_ascii=False))

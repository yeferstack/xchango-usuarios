# -*- coding: utf-8 -*-
"""Cruza HU01-HU77 contra la base de datos estatica generada."""
import json, os, collections

D = "./src/app/data"
def leer(n): return json.load(open(os.path.join(D, n), encoding="utf-8"))

datos = {n[:-5]: leer(n) for n in os.listdir(D) if n.endswith(".json")}
campos_usuario = set(datos["usuarios"][0])
campos_pub     = set().union(*[set(p) for p in datos["publicaciones"]])
campos_trueque = set(datos["trueques"][0])
campos_noti    = set(datos["notificaciones"][0])

# (HU, entidad que la respalda, requisito comprobable)
MATRIZ = [
    ("HU01","usuarios",      lambda: {"nombre","email","ubicacion","password"} <= campos_usuario),
    ("HU02","usuarios",      lambda: "password" in campos_usuario and len({u["email"] for u in datos["usuarios"]})==len(datos["usuarios"])),
    ("HU03","usuarios",      lambda: any(u["verificacion"]=="no_verificado" for u in datos["usuarios"])),
    ("HU04","notificaciones",lambda: any(n["tipo"]=="verificacion" for n in datos["notificaciones"])),
    ("HU05","usuarios",      lambda: {"email","password"} <= campos_usuario),
    ("HU06","usuarios",      lambda: {"email","password"} <= campos_usuario),
    ("HU07","usuarios",      lambda: "id" in campos_usuario),
    ("HU08","usuarios",      lambda: "email" in campos_usuario),
    ("HU09","usuarios",      lambda: "email" in campos_usuario),
    ("HU10","usuarios",      lambda: "password" in campos_usuario),
    ("HU11","—",             None),
    ("HU12","—",             None),
    ("HU13","admins",        lambda: any(a["rol"]=="moderador" for a in datos["admins"])),
    ("HU14","admins",        lambda: any(a["rol"]=="admin" for a in datos["admins"])),
    ("HU15","notificaciones",lambda: any(n["tipo"]=="verificacion" for n in datos["notificaciones"])),
    ("HU16","usuarios",      lambda: any(u["verificacion"]=="verificado" for u in datos["usuarios"])),
    ("HU17","usuarios",      lambda: "verificacion" in campos_usuario),
    ("HU18","usuarios+publicaciones", lambda: "descripcion" in campos_usuario),
    ("HU19","usuarios",      lambda: "id" in campos_usuario),
    ("HU20","usuarios",      lambda: {"verificacion","password"} <= campos_usuario),
    ("HU21","usuarios",      lambda: {"nombre","ubicacion","avatar","telefono","descripcion"} <= campos_usuario),
    ("HU22","usuarios",      lambda: "id" in campos_usuario),
    ("HU23","usuarios",      lambda: all(u["nombre"] and u["email"] and u["telefono"] for u in datos["usuarios"])),
    ("HU24","usuarios",      lambda: "password" in campos_usuario),
    ("HU25","usuarios",      lambda: "password" in campos_usuario),
    ("HU26","usuarios",      lambda: "password" in campos_usuario),
    ("HU27","publicaciones", lambda: {"titulo","descripcion","categoriaId","imagenes","ofreces","buscas"} <= campos_pub),
    ("HU28","publicaciones", lambda: all(p["titulo"] and p["descripcion"] for p in datos["publicaciones"])),
    ("HU29","publicaciones", lambda: any(p["estado"]=="activa" for p in datos["publicaciones"])),
    ("HU30","publicaciones", lambda: "id" in campos_pub),
    ("HU31","publicaciones", lambda: {"titulo","descripcion","imagenes","categoriaId"} <= campos_pub),
    ("HU32","publicaciones", lambda: "fechaModificacion" in campos_pub),
    ("HU33","publicaciones", lambda: "estado" in campos_pub),
    ("HU34","publicaciones", lambda: any(p["estado"] in ("pausada","eliminada") for p in datos["publicaciones"])),
    ("HU35","publicaciones", lambda: "estado" in campos_pub),
    ("HU36","publicaciones+categorias", lambda: {"categoriaId","municipio","estado","titulo"} & campos_pub == {"categoriaId","municipio","estado","titulo"}),
    ("HU37","publicaciones", lambda: len(datos["publicaciones"])>0),
    ("HU38","publicaciones", lambda: {"imagenes","titulo","id"} <= campos_pub),
    ("HU39","publicaciones+usuarios", lambda: "usuarioId" in campos_pub),
    ("HU40","publicaciones", lambda: "imagenes" in campos_pub),
    ("HU41","trueques+reportes", lambda: len(datos["trueques"])>0 and len(datos["publicaciones-reportadas"])>0),
    ("HU42","trueques",      lambda: {"solicitanteId","propietarioId","publicacionId","ofrece","busca"} <= campos_trueque),
    ("HU43","trueques",      lambda: any(t["estado"]=="pendiente" for t in datos["trueques"])),
    ("HU44","notificaciones",lambda: any(n["tipo"]=="solicitud" for n in datos["notificaciones"])),
    ("HU45","trueques",      lambda: "propietarioId" in campos_trueque),
    ("HU46","trueques+notificaciones", lambda: any(t["estado"]=="aceptado" for t in datos["trueques"]) and any(n["tipo"]=="aceptada" for n in datos["notificaciones"])),
    ("HU47","trueques+notificaciones", lambda: any(t["estado"]=="rechazado" for t in datos["trueques"]) and any(n["tipo"]=="rechazada" for n in datos["notificaciones"])),
    ("HU48","REINTERPRETADA",lambda: all(u["telefono"] for u in datos["usuarios"])),
    ("HU49","DESCARTADA",    None),
    ("HU50","trueques",      lambda: any(t["estado"]=="aceptado" for t in datos["trueques"])),
    ("HU51","trueques",      lambda: {"confirmadoSolicitante","confirmadoPropietario"} <= campos_trueque),
    ("HU52","trueques",      lambda: any(t["estado"]=="completado" and t["fechaCierre"] for t in datos["trueques"])),
    ("HU53","trueques+usuarios", lambda: {"calificacionSolicitante","calificacionPropietario"} <= campos_trueque and "calificacion" in campos_usuario),
    ("HU54","notificaciones",lambda: any(n["tipo"]=="solicitud" for n in datos["notificaciones"])),
    ("HU55","notificaciones",lambda: "leida" in campos_noti),
    ("HU56","REINTERPRETADA",lambda: len(datos["notificaciones"])>0),
    ("HU57","notificaciones",lambda: "leida" in campos_noti),
    ("HU58","notificaciones",lambda: any(n["tipo"]=="recordatorio" for n in datos["notificaciones"])),
    ("HU59","notificaciones",lambda: any(n["tipo"]=="recordatorio" and n["referenciaId"] and n["referenciaId"].startswith("tr") for n in datos["notificaciones"])),
    ("HU60","usuarios",      lambda: len(datos["usuarios"])>0),
    ("HU61","usuarios",      lambda: {"activo","suspendido","advertido"} <= {u["estado"] for u in datos["usuarios"]}),
    ("HU62","publicaciones-reportadas", lambda: len(datos["publicaciones-reportadas"])>0),
    ("HU63","publicaciones-reportadas", lambda: {"aprobada","eliminada"} <= {r["estado"] for r in datos["publicaciones-reportadas"]}),
    ("HU64","historial-acciones", lambda: all("adminId" in a for a in datos["historial-acciones"])),
    ("HU65","metricas",      lambda: {"usuarios","publicaciones","intercambios"} <= set(datos["metricas"]["resumen"])),
    ("HU66","metricas",      lambda: len(datos["metricas"]["publicacionesPorCategoria"])>0 and len(datos["metricas"]["actividadPorUbicacion"])>0),
    ("HU67","—",             None),
    ("HU68","historial-acciones", lambda: all(a["fecha"] for a in datos["historial-acciones"])),
    ("HU69","metricas",      lambda: "resumen" in datos["metricas"]),
    ("HU70","alertas",       lambda: any(a["tipo"]=="sospechosa" for a in datos["alertas"])),
    ("HU71","historial-acciones", lambda: all("usuarioId" in a for a in datos["historial-acciones"])),
    ("HU72","usuarios",      lambda: {"publicaciones","intercambios","reportes","nivelActividad","calificacion"} <= campos_usuario),
    ("HU73","historial-acciones", lambda: any(a["accion"]=="Advertencia" for a in datos["historial-acciones"])),
    ("HU74","publicaciones-eliminadas", lambda: all({"publicacionId","motivo","adminId"} <= set(e) for e in datos["publicaciones-eliminadas"])),
    ("HU75","publicaciones-reportadas", lambda: len({r["motivo"] for r in datos["publicaciones-reportadas"]})>1),
    ("HU76","usuarios",      lambda: any(u["intercambios"]>0 for u in datos["usuarios"])),
    ("HU77","metricas",      lambda: len(datos["metricas"]["comparativas"])>0),
]

NOTA = {
    "HU11":"2FA: el código es efímero, no se persiste. Sin dato.",
    "HU12":"2FA: validación en memoria. Sin dato.",
    "HU48":"REINTERPRETADA: sin chat interno. Se cubre con usuarios.telefono -> wa.me.",
    "HU49":"DESCARTADA: guardar mensajes contradice la regla de WhatsApp.",
    "HU50":"'En negociación' = trueque en estado 'aceptado'.",
    "HU56":"REINTERPRETADA: bandeja de NOTIFICACIONES, no de mensajes.",
    "HU57":"Archivar/eliminar = marcar notificación como leída.",
    "HU67":"Exportar Excel/PDF es lógica de frontend. Sin dato nuevo.",
    "HU34":"El JSON usa 'pausada'/'eliminada' en vez de 'inactiva'.",
    "HU27":"'valor' de la HU se implementó como ofreces/buscas. Sin dinero.",
}

ok = falta = sindato = 0
por_entidad = collections.Counter()
print("=" * 74)
print("  COBERTURA HU01-HU77")
print("=" * 74)
for hu, entidad, prueba in MATRIZ:
    if prueba is None:
        estado, sindato = "· sin dato", sindato + 1
    elif prueba():
        estado, ok = "✔ cubierta", ok + 1
        por_entidad[entidad] += 1
    else:
        estado, falta = "✗ FALTA   ", falta + 1
    nota = NOTA.get(hu, "")
    if nota or estado.startswith("✗"):
        print(f"  {hu}  {estado}  {entidad:<28} {nota}")

print("-" * 74)
print(f"  Cubiertas por datos: {ok}   Sin dato necesario: {sindato}   Faltantes: {falta}")
print("-" * 74)
print("  HU respaldadas por entidad:")
for e, c in por_entidad.most_common():
    print(f"    {c:>2}  {e}")
print("=" * 74)

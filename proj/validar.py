# -*- coding: utf-8 -*-
"""Valida la base de datos estatica de XchanGo contra el checklist acordado."""
import json, os, re, collections, sys

D = "./src/app/data"
def leer(n): return json.load(open(os.path.join(D, n), encoding="utf-8"))

usuarios      = leer("usuarios.json")
admins        = leer("admins.json")
categorias    = leer("categorias.json")
publicaciones = leer("publicaciones.json")
trueques      = leer("trueques.json")
reportes      = leer("publicaciones-reportadas.json")
eliminadas    = leer("publicaciones-eliminadas.json")
historial     = leer("historial-acciones.json")
alertas       = leer("alertas.json")
notificaciones = leer("notificaciones.json")
metricas      = leer("metricas.json")

errores, avisos = [], []
def err(m): errores.append(m)

# ---- 1. IDs unicos -----------------------------------------------------
for nombre, lista in [("usuarios", usuarios), ("admins", admins), ("categorias", categorias),
                      ("publicaciones", publicaciones), ("trueques", trueques),
                      ("reportes", reportes), ("eliminadas", eliminadas),
                      ("historial", historial), ("alertas", alertas),
                      ("notificaciones", notificaciones)]:
    ids = [x["id"] for x in lista]
    dup = [i for i, c in collections.Counter(ids).items() if c > 1]
    if dup: err(f"IDs duplicados en {nombre}: {dup}")
    if not all(isinstance(i, str) for i in ids): err(f"IDs no-string en {nombre}")

U   = {u["id"] for u in usuarios}
A   = {a["id"] for a in admins}
C   = {c["id"] for c in categorias}
P   = {p["id"] for p in publicaciones}
T   = {t["id"] for t in trueques}

# ---- 2. Integridad referencial -----------------------------------------
def fk(lista, campo, destino, nombre_destino, origen):
    for x in lista:
        v = x.get(campo)
        if v is not None and v not in destino:
            err(f"{origen}[{x['id']}].{campo}='{v}' no existe en {nombre_destino}")

fk(publicaciones, "usuarioId",     U, "usuarios",      "publicaciones")
fk(publicaciones, "categoriaId",   C, "categorias",    "publicaciones")
fk(trueques,      "solicitanteId", U, "usuarios",      "trueques")
fk(trueques,      "propietarioId", U, "usuarios",      "trueques")
fk(trueques,      "publicacionId", P, "publicaciones", "trueques")
fk(reportes,      "publicacionId", P, "publicaciones", "reportes")
fk(reportes,      "reportanteId",  U, "usuarios",      "reportes")
fk(eliminadas,    "publicacionId", P, "publicaciones", "eliminadas")
fk(eliminadas,    "usuarioId",     U, "usuarios",      "eliminadas")
fk(eliminadas,    "adminId",       A, "admins",        "eliminadas")
fk(historial,     "usuarioId",     U, "usuarios",      "historial")
fk(historial,     "adminId",       A, "admins",        "historial")
fk(notificaciones,"usuarioId",     U, "usuarios",      "notificaciones")

# --- Campos exigidos por las HU ---
VERIF = {"verificado", "no_verificado"}
for u in usuarios:
    for c in ("password","verificacion","descripcion","calificacion","totalCalificaciones"):
        if c not in u: err(f"usuarios[{u['id']}]: falta '{c}' (requerido por las HU)")
    if u.get("verificacion") not in VERIF:
        err(f"usuarios[{u['id']}]: verificacion inválida '{u.get('verificacion')}'")
    if not 0 <= u.get("calificacion", -1) <= 5:
        err(f"usuarios[{u['id']}]: calificación fuera de rango")

TIPOS_NOTI = {"solicitud","aceptada","rechazada","completada","recordatorio","verificacion","moderacion"}
refs = T | P
for n in notificaciones:
    if n["tipo"] not in TIPOS_NOTI:
        err(f"notificaciones[{n['id']}]: tipo inválido '{n['tipo']}'")
    if n["referenciaId"] is not None and n["referenciaId"] not in refs:
        err(f"notificaciones[{n['id']}]: referenciaId '{n['referenciaId']}' no existe")
    for c in ("titulo","mensaje"):
        if not str(n.get(c,"")).strip(): err(f"notificaciones[{n['id']}]: '{c}' vacío")

# Un trueque solo se califica y confirma si esta completado
for t in trueques:
    completo = t["estado"] == "completado"
    for c in ("confirmadoSolicitante","confirmadoPropietario"):
        if t[c] != completo:
            err(f"trueques[{t['id']}].{c} no concuerda con estado '{t['estado']}'")
    for c in ("calificacionSolicitante","calificacionPropietario"):
        v = t[c]
        if v is None: continue
        if not completo: err(f"trueques[{t['id']}]: calificado sin estar completado")
        if not 1 <= v <= 5: err(f"trueques[{t['id']}].{c} fuera del rango 1-5")

# La calificacion del usuario debe ser el promedio real de lo recibido
_recib = collections.defaultdict(list)
for t in trueques:
    if t["calificacionSolicitante"] is not None: _recib[t["propietarioId"]].append(t["calificacionSolicitante"])
    if t["calificacionPropietario"] is not None: _recib[t["solicitanteId"]].append(t["calificacionPropietario"])
for u in usuarios:
    notas = _recib.get(u["id"], [])
    esp = round(sum(notas)/len(notas), 1) if notas else 0.0
    if u["calificacion"] != esp or u["totalCalificaciones"] != len(notas):
        err(f"usuarios[{u['id']}]: calificación {u['calificacion']}/{u['totalCalificaciones']} vs real {esp}/{len(notas)}")

# ---- 3. Coherencia trueque <-> publicacion -----------------------------
dueno = {p["id"]: p["usuarioId"] for p in publicaciones}
for t in trueques:
    if dueno[t["publicacionId"]] != t["propietarioId"]:
        err(f"trueques[{t['id']}]: propietarioId no coincide con el dueño de {t['publicacionId']}")
    if t["solicitanteId"] == t["propietarioId"]:
        err(f"trueques[{t['id']}]: un usuario no puede truequear consigo mismo")
for r in reportes:
    if dueno[r["publicacionId"]] == r["reportanteId"]:
        err(f"reportes[{r['id']}]: el reportante es el dueño de la publicación")
for e in eliminadas:
    if dueno[e["publicacionId"]] != e["usuarioId"]:
        err(f"eliminadas[{e['id']}]: usuarioId no coincide con el dueño de {e['publicacionId']}")
    p = next(x for x in publicaciones if x["id"] == e["publicacionId"])
    if p["estado"] != "eliminada":
        err(f"eliminadas[{e['id']}]: {p['id']} debería tener estado 'eliminada'")

# ---- 4. Campos segun el TIPO de publicacion ----------------------------
BASE = {"id","usuarioId","tipo","categoriaId","titulo","descripcion",
        "ofreces","buscas","imagenes","estado","vistas","fechaCreacion",
        "fechaModificacion"}
REGLAS = {
    "bien_fisico":  {"obligatorios": {"municipio","barrio","cantidadDisponible","disponibilidad"}, "prohibidos": set()},
    "servicio":     {"obligatorios": {"municipio","cantidadDisponible","disponibilidad"},          "prohibidos": {"barrio"}},
    "bien_digital": {"obligatorios": set(),                                                        "prohibidos": {"municipio","barrio","cantidadDisponible","disponibilidad","ubicacion"}},
}
for p in publicaciones:
    tipo = p.get("tipo")
    if tipo not in REGLAS:
        err(f"publicaciones[{p['id']}]: tipo inválido '{tipo}'"); continue
    claves = set(p.keys())
    faltan = (BASE | REGLAS[tipo]["obligatorios"]) - claves
    sobran = claves & REGLAS[tipo]["prohibidos"]
    extra  = claves - BASE - REGLAS[tipo]["obligatorios"]
    if faltan: err(f"publicaciones[{p['id']}] ({tipo}): faltan campos {sorted(faltan)}")
    if sobran: err(f"publicaciones[{p['id']}] ({tipo}): NO debe tener {sorted(sobran)}")
    if extra:  err(f"publicaciones[{p['id']}] ({tipo}): campos inesperados {sorted(extra)}")
    for c in ("ofreces", "buscas"):
        if not str(p.get(c, "")).strip(): err(f"publicaciones[{p['id']}]: '{c}' vacío")

# ---- 5. NADA de dinero -------------------------------------------------
PROHIBIDAS = re.compile(r"\b(precio|precios|pago|pagos|pagar|dinero|moneda|"
                        r"comprar|compra|vender|venta|ventas|costo|tarifa|"
                        r"efectivo|carrito|checkout|cop|usd)\b", re.IGNORECASE)
for nombre, datos in [("usuarios",usuarios),("categorias",categorias),("publicaciones",publicaciones),
                      ("trueques",trueques),("reportes",reportes),("eliminadas",eliminadas),
                      ("historial",historial),("alertas",alertas),("metricas",metricas),
                      ("admins",admins),("notificaciones",notificaciones)]:
    texto = json.dumps(datos, ensure_ascii=False)
    for m in set(PROHIBIDAS.findall(texto)):
        err(f"{nombre}.json contiene terminología monetaria: '{m}'")
    for clave in ("precio","valor","monto","costo","total"):
        if re.search(rf'"{clave}"\s*:', texto):
            if clave == "valor" and nombre == "metricas":
                continue  # 'valor' en series de gráficas = magnitud, no dinero
            err(f"{nombre}.json usa el campo prohibido '{clave}'")

# ---- 6. Sin chat interno / WhatsApp disponible -------------------------
for f in os.listdir(D):
    if re.search(r"^(mensajes|chats|conversaciones)\.json$", f, re.IGNORECASE):
        err(f"Existe un JSON de chat interno: {f}")
# notificaciones.json NO es mensajeria: no debe tener hilo ni emisor
for n in notificaciones:
    for c in ("emisorId","conversacionId","hiloId","respuestaA"):
        if c in n: err(f"notificaciones[{n['id']}]: '{c}' convierte esto en un chat")
for u in usuarios:
    tel = u.get("telefono", "")
    if not re.fullmatch(r"3\d{9}", tel):
        err(f"usuarios[{u['id']}]: teléfono inválido para WhatsApp ('{tel}')")
if len({u["telefono"] for u in usuarios}) != len(usuarios):
    err("Hay teléfonos duplicados entre usuarios")

# ---- 7. Sin desnormalizacion (nombres repetidos) -----------------------
for nombre, lista in [("reportes",reportes),("eliminadas",eliminadas),("historial",historial)]:
    for x in lista:
        for c in ("usuarioNombre","administrador","titulo","categoria"):
            if c in x: err(f"{nombre}[{x['id']}] duplica '{c}' (debe resolverse por ID)")

# ---- 8. Contadores coherentes ------------------------------------------
pc = collections.Counter(p["usuarioId"] for p in publicaciones)
ic = collections.Counter()
for t in trueques:
    if t["estado"] == "completado":
        ic[t["solicitanteId"]] += 1; ic[t["propietarioId"]] += 1
rc = collections.Counter(dueno[r["publicacionId"]] for r in reportes)
for u in usuarios:
    for campo, real in (("publicaciones",pc[u["id"]]),("intercambios",ic[u["id"]]),("reportes",rc[u["id"]])):
        if u[campo] != real:
            err(f"usuarios[{u['id']}].{campo}={u[campo]} pero el real es {real}")

r = metricas["resumen"]
esperado = {
    "usuarios": len(usuarios),
    "usuariosActivos": sum(1 for u in usuarios if u["estado"]=="activo"),
    "publicaciones": sum(1 for p in publicaciones if p["estado"]!="eliminada"),
    "intercambios": sum(1 for t in trueques if t["estado"]=="completado"),
    "publicacionesReportadas": sum(1 for x in reportes if x["estado"]=="pendiente"),
    "usuariosSuspendidos": sum(1 for u in usuarios if u["estado"]=="suspendido"),
}
for k, v in esperado.items():
    if r.get(k) != v: err(f"metricas.resumen.{k}={r.get(k)} pero el real es {v}")

# ---- 9. Vocabulario unico de categorias --------------------------------
nombres_cat = {c["nombre"] for c in categorias}
for serie in ("publicacionesPorCategoria","crecimientoCategorias"):
    for punto in metricas[serie]:
        if punto["label"] not in nombres_cat:
            err(f"metricas.{serie}: '{punto['label']}' no está en categorias.json")

# ---- 10. Municipios de Casanare ---------------------------------------
CASANARE = {"Yopal","Aguazul","Chámeza","Hato Corozal","La Salina","Maní","Monterrey","Nunchía",
            "Orocué","Paz de Ariporo","Pore","Recetor","Sabanalarga","Sácama",
            "San Luis de Palenque","Támara","Tauramena","Trinidad","Villanueva"}
for p in publicaciones:
    if "municipio" in p and p["municipio"] not in CASANARE:
        err(f"publicaciones[{p['id']}]: municipio '{p['municipio']}' no es de Casanare")
for u in usuarios:
    if u["ubicacion"] not in CASANARE:
        err(f"usuarios[{u['id']}]: ubicación '{u['ubicacion']}' no es de Casanare")
for p in publicaciones:
    if "municipio" in p:
        dueno_u = next(u for u in usuarios if u["id"] == p["usuarioId"])
        if p["municipio"] != dueno_u["ubicacion"]:
            avisos.append(f"publicaciones[{p['id']}]: municipio distinto al del dueño (permitido)")

# ---- Reporte -----------------------------------------------------------
print("=" * 62)
print("  VALIDACIÓN DE LA BASE DE DATOS ESTÁTICA — XchanGo")
print("=" * 62)
tipos = collections.Counter(p["tipo"] for p in publicaciones)
print(f"  usuarios: {len(usuarios)}   categorías: {len(categorias)}   admins: {len(admins)}")
print(f"  publicaciones: {len(publicaciones)}  "
      f"(bien_fisico {tipos['bien_fisico']}, servicio {tipos['servicio']}, bien_digital {tipos['bien_digital']})")
print(f"  trueques: {len(trueques)}   reportes: {len(reportes)}   "
      f"eliminadas: {len(eliminadas)}   historial: {len(historial)}")
print(f"  notificaciones: {len(notificaciones)}   "
      f"verificados: {sum(1 for u in usuarios if u['verificacion']=='verificado')}/{len(usuarios)}")
print("-" * 62)
if avisos:
    for a in avisos: print("  aviso:", a)
    print("-" * 62)
if errores:
    print(f"  {len(errores)} ERROR(ES):")
    for e in errores: print("   x", e)
    sys.exit(1)
print("  ✔ IDs únicos y de tipo string")
print("  ✔ Todas las claves foráneas resuelven")
print("  ✔ Campos condicionales por tipo correctos")
print("  ✔ Cero terminología monetaria")
print("  ✔ Cero chat interno · teléfonos válidos para WhatsApp")
print("  ✔ Cero desnormalización de nombres")
print("  ✔ Contadores y métricas coherentes")
print("  ✔ Vocabulario único de categorías")
print("  ✔ Verificación, perfil y calificaciones presentes")
print("  ✔ Notificaciones dirigidas, sin estructura de conversación")
print("=" * 62)

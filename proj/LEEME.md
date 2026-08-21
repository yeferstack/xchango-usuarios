# XchanGo — Proyecto completo

Compilado y verificado: `ng build` sin errores, 0 enlaces rotos, 0 TODOs.

## Arrancar

```powershell
npm install
ng serve -o
```

Entra por **/acceso** con `carlos.ospina@mail.com` / `Carlos123*`
(o el botón "Entrar como usuario de prueba").
Panel admin: **/admin/login** con `admin@xchango.com` / `admin123`.

## Iconos: ahora todos iguales

Antes había dos estilos mezclados: la fuente Material Icons en 9 páginas y SVG
de línea en el login. Se dejó el del login (trazo de 2, puntas redondeadas)
y se aplicó a toda la app con el componente `components/icono`.

```html
<app-icono nombre="home"></app-icono>
<app-icono class="option-card__icon" nombre="badge"></app-icono>
```

El SVG se mide en `em`, así que las reglas de CSS que ya existían
(`font-size`, `color`) siguen sirviendo igual que con la fuente.
Para agregar un icono nuevo se añade su nombre y su trazo en `icono.ts`.

## Navbar

Quedaron solo los tres que funcionan: **Inicio · Explorar · Servicios**.
Se quitaron Favoritos, Mensajes y los demás que no llevaban a ninguna parte.
La foto de la derecha ahora abre **/perfil**.

## Quitado

Verificación en dos pasos y Dispositivos vinculados, en Seguridad y en Datos
de la cuenta, junto con el código que quedó sin uso.

## Reiniciar los datos

En la consola del navegador:

```js
localStorage.clear(); location.reload();
```

## Verificar la base de datos

```bash
python3 validar.py
python3 cobertura_hu.py
```

## Nota de seguridad

Las contraseñas están en texto plano y en localStorage. Es a propósito para una
base estática de práctica; nunca lo repliques contra un backend real.

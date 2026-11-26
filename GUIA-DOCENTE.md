# BigoBooks · ensayo de presentación

En Windows, abrir `start-dev.cmd` si los servicios no están levantados. Esperar a que Eureka (`http://localhost:8761`) muestre Auth, Stock, Compras, Ventas y Gateway en `UP`. Abrir `http://localhost:3000`. Preparar cuentas de demostración con permisos conocidos y libros con existencias. Usar datos de prueba.

## Empezar por el correo (así el cron corre mientras se presenta)

Auth recoge pendientes en los minutos pares, segundo cero. Por defecto **no envía**. Para una demo sin correo externo usar un buzón SMTP local como Mailpit. Si Docker está disponible:

```powershell
docker run --rm --name bb-demo-mail -p 127.0.0.1:1025:1025 -p 127.0.0.1:8025:8025 axllent/mailpit
```

En el `config/private.properties` local de Auth (no versionar), configurar lo siguiente y reiniciar **solo Auth**. El mismo ajuste funciona con variables de entorno del proceso.

```properties
MAIL_ENABLED=true
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_SMTP_AUTH=false
MAIL_SMTP_STARTTLS=false
MAIL_FROM=demo@example.test
MAIL_CONTACT_TO=soporte@example.test
```

1. Abrir **Contacto** desde el pie de página, enviar un mensaje de asunto reconocible. La confirmación significa **encolado**, no entregado. En la BD, buscar la fila:

   ```sql
   SELECT id, subject, pending, attempts, sent_at, last_error
   FROM mail_outbox ORDER BY id DESC LIMIT 10;
   ```

2. Con Auth en marcha, al procesar esa fila el mensaje aparece en `http://localhost:8025`; `pending` cambia a `false`, `sent_at` se completa y aumenta `attempts`. Por defecto procesa un pendiente por ejecución; si hay pendientes anteriores, esperar los ciclos necesarios.
3. Esperar otro ciclo: **esa fila** no vuelve a enviarse. Para mostrar lo que pidió el profesor, sustituir `:id_demo` por el ID de esa única consulta:

   ```sql
   UPDATE mail_outbox SET pending = true WHERE id = :id_demo AND pending = false;
   ```

   En el siguiente turno le corresponde un nuevo envío. Si SMTP falla, queda pendiente y se registra el error. SMTP y PostgreSQL no comparten una transacción: una caída justo después de la aceptación SMTP y antes del commit puede producir un duplicado.

4. Alternativa sin instalar buzón: en `Libreria-MS-Auth`, `.\mvnw.cmd -B "-Dtest=MailOutboxServiceTest" test`. La prueba usa un servidor SMTP local de prueba y una cola simulada; no requiere contraseña ni entrega correo externo.

## Recorrido de pantallas

| Requisito | Qué hacer y qué observar |
|---|---|
| Registro y autenticación | Sin sesión, abrir **Perfil → Crear cuenta**, registrar una cuenta de prueba e iniciar sesión desde el enlace. |
| Autorización y roles | Comparar una cuenta `CLIENT` con una de vendedor. La BD de demo utiliza `SALLER` para vendedor; Auth, Stock, Compras y Ventas aceptan `SALLER`/`SELLER`/`VENDEDOR` en las operaciones de vendedor. Un usuario **solo `CLIENT`** ve únicamente **Configuración** y **Logout** en Perfil; un usuario con otro rol además ve **Panel Cliente**. La API de usuarios sigue siendo exclusiva de `ADMIN`. |
| CRUD de usuarios | Como administrador: **Panel Admin → Usuarios → Nuevo usuario**. Crear una cuenta temporal, buscarla por correo, cambiar su ciudad, guardar, eliminarla y volver a buscarla. Es una baja lógica; no se eliminan pedidos. |
| Tres cabeceras con detalle | **Venta:** carrito con dos libros → checkout; mostrar destinatario y líneas del pedido. **Compra:** `/vendedor/compras/nueva`, mostrar proveedor/almacén y dos líneas de libros. **Ajuste:** `/vendedor/inventario/nuevo`, mostrar almacén/nota y dos líneas de ajuste. Las tres pantallas usan formularios de cabecera + detalle. Asignar un flujo a cada integrante. |
| Búsqueda, filtros y paginación | **Mis compras**: buscar número de pedido o factura, filtrar por fecha o total, ordenar por un encabezado y cambiar de página con datos suficientes. También se puede paginar el catálogo. |
| Reporte | **Panel Vendedor → Reportes**. Elegir Top 5/10, comparar las unidades de pedidos **pagados** y descargar el CSV. |
| Configuración y UI | **Perfil → Configuración** (cliente) o **Perfil → Configuración** (vendedor/admin). Elegir entre Claro, Oscuro, Violeta, Esmeralda, Corporativo o Drácula; recargar y comprobar que se conserva. La navegación principal ya no repite `INICIO` en admin/vendedor porque el logo vuelve al inicio. |
| Cupones | Como vendedor: **Cupones → Nuevo cupón**. Definir código, porcentaje (1–100), vigencia desde/hasta, libros opcionales y “un solo uso por usuario”. Sin libros el cupón aplica a todo el pedido; con libros, el descuento se calcula solo sobre esos libros. Probar un código vencido, uno futuro y un segundo uso por el mismo usuario. |
| Stock | Tras pagar una venta (`PAID`), abrir **Panel Vendedor → Catálogo** o consultar el stock de la sucursal. El pago descuenta una sola vez y la UI invalida la caché de stock/catálogo. Los roles `SALLER/SELLER/VENDEDOR` ya pueden consultar stock y ajustes de inventario. |
| Transacciones | En Rentas mostrar `OrderService` (pago) y `StockService` (`MANDATORY`): el descuento de stock participa en la transacción del pago. En Compras, `SupplierServiceImpl` contiene los ejemplos de `REQUIRED`, `REQUIRES_NEW`, `SUPPORTS`, `NOT_SUPPORTED`, `MANDATORY` y `NEVER`. |

## Tomcat

En el árbol de trabajo **tomcat** de la UI, `pnpm install --frozen-lockfile` y `mvn package` generan `target/ROOT.war` mediante exportación estática. Las rutas de detalle son `/pago/?numeroOrden=...` y `/pedidos/?numeroOrden=...`. El filtro Java mantiene el login en las rutas privadas, incluyendo `/perfil` y `/vendedor/cupones`.

El WAR construido para dev apunta al Gateway `http://localhost:8080`. Para otro host/puerto, fijar `NEXT_PUBLIC_API_BASE_URL` **antes de empaquetar**, permitir el origen del front en el Gateway y usar las versiones actualizadas de Auth, Common, Stock, Ventas y Gateway (incluido `/auth/contact` público). Entregar el WAR según el procedimiento de despliegue del equipo.

## Cómo armar el `.zip` para los compañeros

Opción recomendada: zip de **código fuente + WAR ya compilado**, sin `node_modules`, `target` intermedios ni logs.

```powershell
$out = "C:\Users\LABTECH\Desktop\BigoBooks-entrega.zip"
$tmp = "C:\Users\LABTECH\AppData\Local\Temp\opencode\bigobooks-zip"
if (Test-Path $tmp) { Remove-Item -Recurse -Force $tmp }
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
```

1. Copiar los módulos a `$tmp` excluyendo `.git`, `node_modules`, `.next`, `out`, `target`, `logs`, `*.log` y `config/private.properties`.
2. Incluir el WAR `ui-tomcat\target\ROOT.war` dentro de `$tmp\entrega\ROOT.war`.
3. Incluir `GUIA-DOCENTE.md` y un `LEEME.txt` con:
   - Java 21, Node 20+, Maven.
   - `.\mvnw.cmd -DskipTests package` por backend.
   - `npm install` y `npm run dev` para UI de desarrollo.
   - `ROOT.war` se copia a `webapps` de Tomcat 11.
   - Variables SMTP (`MAIL_*`) y URL del Gateway.
4. Comprimir:

```powershell
Compress-Archive -Path "$tmp\*" -DestinationPath $out -Force
Get-Item $out | Select-Object FullName,Length
```

No incluir `config/private.properties`, contraseñas de base de datos, tokens ni el archivo `mail_outbox` con datos personales. Para una entrega solo-WAR, comprimir únicamente `target\ROOT.war` y el `LEEME.txt`.

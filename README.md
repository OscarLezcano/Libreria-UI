# Dependencias utilizadas

### Diseño
- **Tailwind CSS** → Framework de utilidades CSS
- **DaisyUI** → Componentes predefinidos para Tailwind
- **Lucide React** → Iconos

### Lógica
- **TanStack Query** → Gestión de llamadas al backend
- **Zod** → Validación de formularios

## Empaquetar para Tomcat

El frontend se exporta como sitio estático y se empaqueta en un WAR para Tomcat 11. Requiere Node.js, npm y Java 17 o superior:

```bash
npm ci
NEXT_PUBLIC_API_BASE_URL=http://localhost:8088 npm run war
```

El archivo se genera en `target/ROOT.war` y se sirve desde la raíz de Tomcat (`/`). En desarrollo, `npm run dev` también usa rutas desde la raíz, por ejemplo `http://localhost:3000/explorar/`. La URL del backend se incorpora al compilar; ajustá `NEXT_PUBLIC_API_BASE_URL` al entorno de despliegue. El WAR conserva la redirección a login y las rutas anteriores de libros, compras y sucursales.

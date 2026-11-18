# Instrucciones para GitHub Copilot: Frontend Angular CoffeeHouse (UX/UI Senior Dark Luxury)

## 1. Regla Estricta: Cero Hardcodeo (100% Base de Datos)
Absolutamente TODOS los datos (títulos del Hero, videos en bucle, servicios con sus fotos, especialidades con sus fotos, historia, fotos de la tienda, productos con sus fotos/precios y contactos) deben extraerse del backend Node.js (`http://localhost:3000/api`) usando `HttpClient`. Prohibido hardcodear listas de productos, precios, imágenes o videos en el HTML o TypeScript.
Configura `provideHttpClient()` en `src/app/app.config.ts`.

## 2. Endpoints a Consumir en `src/app/services/api.service.ts`
- `getInfo()`: `GET http://localhost:3000/api/cafeteria-info` (Tomar el elemento `[0]` que contiene: `nombre`, `etiqueta_ubicacion`, `titulo_parte1`, `titulo_destacado`, `titulo_parte2`, `subtitulo_hero`, `texto_boton_hero`, `video_url`, `historia`, `filosofia`, `direccion`, `ciudad`, `telefono`, `email`, `horarios`, `foto_tienda_1`, `foto_tienda_2`, `foto_tienda_3`).
- `getServicios()`: `GET http://localhost:3000/api/servicios` (`id`, `nombre`, `descripcion`, `categoria_badge`, `horario_o_detalle`, `imagen`).
- `getEspecialidades()`: `GET http://localhost:3000/api/especialidades` (`id`, `nombre`, `origen_grano`, `notas_cata`, `metodo_extraccion`, `barista_autor`, `descripcion`, `imagen`).
- `getProductosPrecios()`: `GET http://localhost:3000/api/productos-precios` (`id`, `nombre`, `categoria`, `descripcion`, `precio_bob`, `tamanio_presentacion`, `destacado`, `imagen`).
- `enviarContacto(datos)`: `POST http://localhost:3000/api/contactos` (`nombre_completo`, `email`, `telefono`, `motivo_contacto`, `fecha_reserva`, `cantidad_personas`, `mensaje`).
- `enviarPreguntaChatbot(prompt: string)`: `POST http://localhost:3000/api/chatbot` enviando `{ "prompt": prompt }` y recibiendo `{ "response": "..." }`.

## 3. Dirección de Arte y Diseño UX/UI Senior (Basado en la imagen de referencia + Webs de Cafeterías de Lujo)
- **Tipografías de Google Fonts** (importar en `index.html` o `styles.scss`):
  - `'Playfair Display', serif` (para títulos editoriales y el texto en cursiva dorada).
  - `'Plus Jakarta Sans', sans-serif` (para navegación, subtítulos, badges y lectura limpia).
- **Paleta de Colores (Dark Espresso & Gold Luxury)**:
  - Fondo principal oscuro: `#0b0908` (Obsidian Espresso)
  - Fondo secundario de secciones/tarjetas: `#14110f` y `#1c1714` con bordes sutiles `rgba(212, 163, 115, 0.18)`
  - Dorado / Bronce Café (Accent): `#c89b65` y `#d4a373`
  - Texto principal: `#f8f5f0` (Crema cálido)
  - Texto secundario: `#a89f96`

## 4. Estructura Exacta de Secciones

### Navbar Superior Fijo (Idéntico a la imagen de referencia)
- Fondo negro translúcido (`rgba(10, 9, 8, 0.88)`) con `backdrop-filter: blur(12px)`.
- **Izquierda**: Punto circular color dorado/ámbar (`#d4a373`) seguido del nombre dinámico `{{ info?.nombre }}` en color blanco y fuente limpia.
- **Derecha**: Enlaces en MAYÚSCULAS con `letter-spacing: 2.5px`, tamaño `0.78rem`, color blanco: `INICIO` (`#inicio`), `SERVICIOS` (`#servicios`), `ESPECIALIDADES` (`#especialidades`), `NOSOTROS` (`#nosotros`), `PRODUCTOS` (`#productos`), `CONTACTO` (`#contacto`).

### Sección 1: INICIO (`#inicio` - Hero idéntico a la imagen subida)
- **Video en Bucle Dinámico desde BD**:
  - En TypeScript, separa `info.video_url` por comas (`info.video_url.split(',')`) en un array `listaVideos: string[]`.
  - Renderiza `<video *ngIf="listaVideos.length" [src]="listaVideos[videoActualIndex]" [muted]="true" autoplay loop playsinline (loadedmetadata)="forzarPlay($event)" (ended)="siguienteVideo()" class="hero-video"></video>`.
  - Aplica un overlay oscuro con gradiente hacia la izquierda (`linear-gradient(90deg, rgba(8,7,6,0.82) 0%, rgba(8,7,6,0.45) 55%, rgba(8,7,6,0.35) 100%)`) para que el texto izquierdo resalte igual que en la foto.
- **Contenido alineado a la izquierda**:
  1. Línea horizontal dorada de `35px` a la izquierda + texto en mayúsculas espaciadas color dorado (`letter-spacing: 3px`): `{{ info?.etiqueta_ubicacion }}` (ej. `COCHABAMBA · BOLIVIA`).
  2. Título gigante en 3 líneas exactas como la captura:
     - Línea 1: `{{ info?.titulo_parte1 }}` en blanco bold sans-serif + `<span class="italic-gold">{{ info?.titulo_destacado }}</span>` en fuente `'Playfair Display'`, cursiva (`italic`) y color dorado `#d4a373`.
     - Línea 2: `{{ info?.titulo_parte2 }}` ("Café de la" / "Ciudad") en blanco bold gigante (`clamp(3rem, 6vw, 5.2rem)`).
  3. Subtítulo debajo en gris claro: `{{ info?.subtitulo_hero }}`.
  4. Botón sólido rectangular color dorado ocre (`#c58b43`), texto negro en mayúsculas con `letter-spacing: 2px` y negrita: `{{ info?.texto_boton_hero }}` que hace scroll suave hacia `#productos`.

### Sección 2: SERVICIOS (`#servicios` - Bento Cards elegantes con fotos de BD)
- Grid de 3 columnas con tarjetas oscuras (`#151210`), imagen superior extraída de `s.imagen` con efecto zoom suave en hover, badge flotante dorado `s.categoria_badge`, título `s.nombre`, descripción `s.descripcion` y pie de tarjeta con icono de reloj mostrando `s.horario_o_detalle`.

### Sección 3: ESPECIALIDADES (`#especialidades` - Signature Pour-Over & Espresso Showcase)
- Tarjetas horizontales de lujo iterando `*ngFor="let e of especialidades"`.
- Muestra la fotografía `e.imagen`, nombre `e.nombre`, ficha técnica de cata con etiquetas elegantes para **Origen:** `e.origen_grano`, **Notas de Cata:** `e.notas_cata`, **Método:** `e.metodo_extraccion`, **Barista:** `e.barista_autor` y descripción `e.descripcion`.

### Sección 4: NOSOTROS (`#nosotros` - Editorial Story, Galería de 3 Fotos y Ubicación)
- Layout asimétrico de 2 columnas:
  - Columna izquierda: Historia (`info?.historia`), Filosofía (`info?.filosofia`), y tarjetas informativas con Dirección (`info?.direccion`, `info?.ciudad`), Teléfonos (`info?.telefono`), Email (`info?.email`) y Horarios (`info?.horarios`).
  - Columna derecha: Collage editorial con las 3 fotos reales de la tienda extraídas de la BD (`info?.foto_tienda_1`, `info?.foto_tienda_2`, `info?.foto_tienda_3`).

### Sección 5: PRECIOS Y PRODUCTOS (`#productos` - Menú Interactivo con Filtro Dinámico)
- Botones de filtro por categoría generados dinámicamente a partir de las categorías únicas que vienen en `productos_precios` (más un botón "Todos").
- Grid de tarjetas de productos con foto (`p.imagen`), badge superior (`p.destacado`), categoría (`p.categoria`), nombre del producto (`p.nombre`), tamaño (`p.tamanio_presentacion`), descripción (`p.descripcion`) y precio destacado en dorado: `Bs. {{ p.precio_bob }}`.

### Sección 6: CONTACTOS (`#contacto` - Formulario de Contacto y Reserva de Mesa/Coworking)
- Formulario conectado a `POST /api/contactos` usando `FormsModule` con campos: `nombre_completo`, `email`, `telefono`, `motivo_contacto` (select: Reserva de Mesa, Espacio Coworking, Catering de Eventos, Consulta General), `fecha_reserva`, `cantidad_personas` y `mensaje`. Muestra alerta de confirmación al guardar en MySQL.

### Widget Flotante de Chatbot IA (Barista Virtual Ollama + Gemma3)
- Botón flotante dorado/oscuro abajo a la derecha (`☕ Barista IA`).
- Ventana de chat con estética Dark Luxury que envía las preguntas a `POST /api/chatbot`, muestra estado "Preparando respuesta..." y responde con los precios y productos reales de MySQL.
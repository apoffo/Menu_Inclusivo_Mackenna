# 🍽️ Menú Inclusivo — Cartas Gastronómicas Accesibles

Plataforma web pensada para bares, restaurantes, cafés y heladerías de Argentina, basada en el proyecto de ordenanza municipal que exige cartas accesibles con pictogramas (**ARASAAC**) y en **Sistema Braille** para personas con discapacidad visual, TEA (Trastorno del Espectro Autista), discapacidad cognitiva, afasia o barreras idiomáticas.

---

## 🚀 Guía de Despliegue en Vercel mediante GitHub

El proyecto ya está 100% optimizado para compilar y publicarse en **Vercel** conectado a un repositorio de **GitHub**.

### Paso 1: Subir el código a GitHub

Si aún no inicializaste el repositorio git en tu computadora:

```bash
git init
git add .
git commit -m "feat: Menú Inclusivo con soporte para Vercel y GitHub"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/menu-inclusivo.git
git push -u origin main
```

### Paso 2: Importar el repositorio en Vercel

1. Ingresá a tu cuenta en [vercel.com](https://vercel.com).
2. Hacé clic en **"Add New..."** → **"Project"**.
3. Seleccioná tu proveedor de **GitHub** y buscá el repositorio `menu-inclusivo`.
4. Hacé clic en **"Import"**.

### Paso 3: Configuración del proyecto en Vercel

Vercel detectará automáticamente la configuración gracias al archivo `vercel.json` incluido:

- **Framework Preset**: `Vite`
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Variables de Entorno (Opcionales):
El proyecto ya cuenta con configuración de Firebase lista para funcionar out-of-the-box (`firebase-applet-config.json`). Si preferís definir las variables desde el panel de Vercel (*Settings* → *Environment Variables*), podés copiar las siguientes de `.env.example`:

- `VITE_FIREBASE_PROJECT_ID`: `neat-theorem-k3kqt`
- `VITE_FIREBASE_API_KEY`: `AIzaSyBFhCr7F__T7BsAtrg8A6PuNww8jXpTsF4`
- `VITE_FIREBASE_AUTH_DOMAIN`: `neat-theorem-k3kqt.firebaseapp.com`
- `VITE_FIREBASE_DATABASE_ID`: `ai-studio-meninclusivo-5625b073-068b-4693-b478-f0bb59afb935`
- `VITE_FIREBASE_APP_ID`: `1:930336750804:web:26c02ff24b97ea20140f41`

### Paso 4: Desplegar

Hacé clic en **"Deploy"**. Vercel compilará la aplicación y en aproximadamente 1 minuto tendrás tu URL pública (ejemplo: `https://menu-inclusivo.vercel.app`).

Cada vez que hagas un `git push` a la rama `main`, Vercel actualizará tu sitio automáticamente.

---

## 🌟 Características Principales

1. **Barra de Accesibilidad Universal (WCAG 2.1 nivel AA)**:
   - Modos de Alto Contraste: Estándar, Blanco sobre Negro y Amarillo sobre Negro (óptimo para baja visión).
   - Ajuste de tamaño de fuente (Normal, Grande, Extra Grande).
   - Tipografía hiperlegible (Verdana / Atkinson Hyperlegible).
   - **Modo Pictogramas**: Vista ultra-simplificada para personas con TEA, afasia o niños.
   - **Lector en voz alta**: Lectura por audio con la Web Speech API en español argentino (`es-AR`).

2. **Cartas con Pictogramas ARASAAC y Fotos**:
   - Buscador integrado en vivo conectado con la API de ARASAAC (`api.arasaac.org`).
   - Descripciones alternativas (*alt text*) obligatorias para lectores de pantalla.
   - Traducción de términos culinarios extranjeros en español.

3. **Sistema Braille Completo (Español Grado 1)**:
   - Conversión con reglas de prefijo numérico (`⠼`), mayúscula (`⠨`) y acentos (`á, é, í, ó, ú, ü, ñ`).
   - Visualizador de puntos Unicode (`U+2800–U+28FF`).
   - Descarga en **PDF A4** listo para imprimir.
   - Descarga en archivo **`.brf`** para impresoras embosser Braille.

4. **Descargas y Códigos QR**:
   - Descarga de carta completa en PDF A4 de alto contraste.
   - Generación de código QR descargable en PNG para mesas y mostradores.

5. **Panel del Comercio**:
   - Gestión de categorías y platos.
   - Selección de hasta 3 productos destacados para la portada.
   - Semáforo / checklist de cumplimiento de la ordenanza municipal.

6. **Panel de Auditoría Municipal**:
   - Padrón de comercios adheridos.
   - Otorgamiento de la Oblea Oficial "Comercio Inclusivo" (Art. 8).
   - Suspensión y reactivación de cuentas.

---

## 🛠️ Tecnologías Utilizadas

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS 4**
- **Firebase Firestore**
- **jsPDF** (generación de documentos A4)
- **QRCode** (generación de códigos para mesas)
- **Lucide Icons** & **Motion**

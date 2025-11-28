# Cube Planet - Three.js Project

Un proyecto de visualización 3D que muestra un planeta con forma de cubo usando Three.js, React, TypeScript y Vite.

## 🚀 Características

- ✨ Planeta cúbico 3D renderizado con Three.js
- ⚛️ React 19 con TypeScript
- ⚡ Vite para desarrollo rápido
- 🧪 Vitest para testing
- 🎨 Cada cara del cubo tiene un color diferente
- 🔄 Animación de rotación continua
- 📱 Responsive design

## 📋 Requisitos Previos

- Node.js 20.x o superior
- npm o yarn

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install
```

## 🎮 Scripts Disponibles

### Desarrollo
```bash
npm run dev
```
Inicia el servidor de desarrollo en `http://localhost:5173`

### Build
```bash
npm run build
```
Compila el proyecto para producción en la carpeta `dist/`

### Preview
```bash
npm run preview
```
Previsualiza la build de producción localmente

### Tests
```bash
npm run test          # Ejecuta tests en modo watch
npm run test:ui       # Abre la interfaz de Vitest
npm run test:coverage # Genera reporte de cobertura
```

### Lint
```bash
npm run lint
```
Ejecuta ESLint para verificar la calidad del código

## 📦 Dependencias Principales

- **three** - Librería 3D para WebGL
- **react** - Librería UI
- **vite** - Build tool y dev server
- **vitest** - Framework de testing
- **typescript** - Lenguaje con tipado estático

## 🏗️ Estructura del Proyecto

```
mars-rovers-ai-jam/
├── src/
│   ├── components/
│   │   ├── PlanetViewer.tsx      # Componente principal del visor
│   │   └── PlanetViewer.css      # Estilos del visor
│   ├── three/
│   │   └── CubePlanet.ts         # Clase de Three.js para el cubo
│   ├── test/
│   │   ├── setup.ts              # Configuración de tests
│   │   └── PlanetViewer.test.tsx # Tests del componente
│   ├── App.tsx                   # Componente raíz
│   ├── App.css                   # Estilos de la app
│   ├── main.tsx                  # Punto de entrada
│   └── index.css                 # Estilos globales
├── public/                       # Archivos estáticos
├── dist/                         # Build de producción
├── vitest.config.ts              # Configuración de Vitest
├── vite.config.ts                # Configuración de Vite
├── vercel.json                   # Configuración de Vercel
└── tsconfig.json                 # Configuración de TypeScript
```

## 🌐 Deployment en Vercel

### Opción 1: Desde la CLI de Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Opción 2: Desde GitHub

1. Sube el proyecto a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Importa tu repositorio
4. Vercel detectará automáticamente la configuración de Vite
5. Haz clic en "Deploy"

El archivo `vercel.json` ya está configurado con los comandos necesarios.

## 🎨 Personalización

### Cambiar colores del cubo

Edita el archivo `src/three/CubePlanet.ts` en el método `createCubePlanet()`:

```typescript
const materials = [
  new THREE.MeshStandardMaterial({ color: 0xff6b6b }), // Cara derecha
  new THREE.MeshStandardMaterial({ color: 0x4ecdc4 }), // Cara izquierda
  new THREE.MeshStandardMaterial({ color: 0xffe66d }), // Cara superior
  new THREE.MeshStandardMaterial({ color: 0x95e1d3 }), // Cara inferior
  new THREE.MeshStandardMaterial({ color: 0xf38181 }), // Cara frontal
  new THREE.MeshStandardMaterial({ color: 0xaa96da }), // Cara trasera
];
```

### Ajustar velocidad de rotación

En `src/three/CubePlanet.ts`, método `animate()`:

```typescript
this.cube.rotation.x += 0.005; // Aumenta para rotación más rápida
this.cube.rotation.y += 0.005;
```

## 📚 Documentación de Referencia

- [Three.js Documentation](https://threejs.org/docs/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Vercel Documentation](https://vercel.com/docs)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

Creado con ❤️ usando Three.js, React, TypeScript y Vite

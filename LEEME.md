# PaperStock — Guía de instalación

Este paquete contiene el código completo de la app (pantallas, componentes,
contexto de datos y tema visual). Está pensado para **copiarse dentro de tu
proyecto Expo existente** en `C:\Users\Diana\PaperStock`.

## 1. Copiar archivos

Copia estas carpetas dentro de tu proyecto, reemplazando lo que ya exista
(si tu proyecto usa Expo Router, seguramente ya tienes una carpeta `app/`;
revisa antes de sobrescribir si tenías algo propio ahí):

```
PaperStock/
├── app/
├── components/
├── constants/
├── context/
├── types/
```

## 2. Instalar dependencias

Desde la raíz de tu proyecto (`C:\Users\Diana\PaperStock`), corre:

```bash
npx expo install @react-native-async-storage/async-storage
npx expo install expo-splash-screen
npm install @expo-google-fonts/poppins expo-font
```

`@expo/vector-icons` normalmente ya viene incluido con Expo; si no,
instálalo con `npx expo install @expo/vector-icons`.

## 3. Verificar app.json / app.config

Asegúrate de que tu `app.json` tenga configurado el splash screen básico
de Expo (ya viene por defecto en proyectos nuevos, no necesitas tocarlo).

## 4. Correr el proyecto

```bash
npx expo start
```

## 5. Iniciar sesión

El login es una validación básica local (no hay backend todavía): puedes
entrar con cualquier correo y una contraseña de 4 caracteres o más, por
ejemplo:

- Correo: `diana@paperstock.com`
- Contraseña: `1234`

## ¿Qué incluye esta primera versión?

- **Login** con validación básica y persistencia de sesión.
- **Dashboard** con resumen de inventario, movimientos recientes y accesos rápidos.
- **Productos**: listar, buscar, filtrar por categoría, agregar, editar, eliminar y ver detalle.
- **Categorías**: listar y agregar nuevas categorías con icono y color.
- **Inventario**: vista independiente con buscador y filtros por estado (normal / bajo / sin stock), calculado automáticamente.
- **Entradas**: listar y registrar, sumando al stock del producto.
- **Salidas**: listar y registrar, restando del stock y bloqueando cantidades mayores al disponible.
- **Alertas de stock**: productos con stock bajo o sin existencia.
- **Notificaciones**: avisos automáticos generados por el sistema (entradas, salidas, stock bajo, sin stock).
- **Perfil**: datos básicos del usuario y cerrar sesión.

Todos los datos (productos, categorías, movimientos, notificaciones) se
guardan localmente en el dispositivo con AsyncStorage, así que persisten
aunque cierres la app. No hay servidor ni base de datos remota — es
suficiente para un proyecto académico funcional.

## Siguientes pasos sugeridos

1. Prueba la app tal como está y dime qué necesitas ajustar (colores, textos, flujo).
2. Si más adelante quieres un backend real (por ejemplo con Firebase o una API),
   lo agregamos como un módulo aparte sin tener que rehacer las pantallas.
3. Podemos revisar módulo por módulo cualquier detalle visual para que quede
   más parecido aún al mockup que compartiste.

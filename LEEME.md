# PaperStock — Guía de instalación

Este paquete contiene el código completo de la app, **ya conectado a Firebase**
(Authentication + Firestore) como base de datos en la nube.

## 1. Copiar archivos

Copia estas carpetas dentro de `src/` de tu proyecto (reemplazando lo que ya exista):

```
PaperStock/
├── app/
├── components/
├── constants/
├── context/
├── types/
```

## 2. Instalar dependencias

Desde la raíz de tu proyecto, corre:

```bash
npm install firebase
npx expo install @react-native-async-storage/async-storage
npx expo install expo-splash-screen
npx expo install @expo/vector-icons
npm install @expo-google-fonts/poppins expo-font
```

## 3. Correr el proyecto

```bash
npx expo start
```

## 4. Iniciar sesión

El login ahora usa **cuentas reales de Firebase Authentication**. La primera
vez que uses un correo, la app lo registra automáticamente (no necesitas
crear la cuenta por separado). Requisitos:

- Correo válido (cualquiera, no se envía verificación).
- Contraseña de **6 caracteres o más** (mínimo que exige Firebase).

Ejemplo: `diana@paperstock.com` / `123456`

La segunda vez que uses ese mismo correo y contraseña, inicia sesión con la
cuenta ya creada. Puedes ver los usuarios registrados en Firebase Console →
Authentication → Usuarios.

## ¿Qué cambió respecto a la versión anterior?

- **Antes**: los datos se guardaban solo en el celular (AsyncStorage).
- **Ahora**: los datos viven en **Firestore**, la base de datos en la nube de
  Firebase. Esto significa que:
  - Si abres la app desde otro dispositivo con la misma base de Firebase,
    verás la misma información.
  - Los cambios se sincronizan en tiempo real.
  - El login es una cuenta real (no una simulación).
  - "Cambiar contraseña" ahora sí actualiza tu contraseña real.
  - "Editar perfil" solo permite cambiar el nombre (el correo no se puede
    editar por seguridad de la cuenta).

## Importante sobre las reglas de Firestore

Tu base de datos quedó en "modo de prueba", lo que permite lectura y
escritura sin restricciones hasta la fecha que configuraste (revísala en
Firebase Console → Firestore Database → Reglas). Después de esa fecha, la
app dejará de poder leer/escribir datos hasta que actualices las reglas.
Para un proyecto académico esto es suficiente, pero si vas a seguir usando
la app después de esa fecha, avísame para configurar reglas de seguridad
permanentes.


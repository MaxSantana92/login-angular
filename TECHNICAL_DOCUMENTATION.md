# Documentación Técnica: Aplicación de Autenticación con Angular

## 1. Resumen del Proyecto

Esta aplicación es una implementación de un flujo de autenticación moderno y robusto utilizando Angular (v18+). El objetivo principal era construir una base segura, escalable y con una excelente experiencia de usuario, siguiendo las mejores prácticas del ecosistema Angular actual.

Las características clave incluyen:

- Arquitectura basada en **Componentes Standalone**.
- Gestión de estado reactiva y performante con **Signals**.
- Autenticación JWT con una estrategia de **renovación de token (Refresh Token)** automática.
- Protección de rutas (Route Guards) y carga perezosa (Lazy Loading).
- Manejo de errores global y notificaciones al usuario.

---

## 2. Decisiones Arquitectónicas y Tecnologías Core

### 2.1. Componentes Standalone

Se optó por una arquitectura 100% basada en Componentes Standalone. Esta es la dirección moderna y recomendada por el equipo de Angular.

- **Decisión Técnica:** Evitar `NgModules` para reducir el código boilerplate, simplificar la estructura mental del proyecto y mejorar la encapsulación de las dependencias de cada componente. Cada componente, ruta y servicio gestiona sus propias dependencias.

### 2.2. Gestión de Estado con Signals

Para manejar el estado de autenticación (ej. `currentUser`, `isAuthenticated`), se utilizó `signals` y `computed` signals.

- **Decisión Técnica:** Los `signals` ofrecen un modelo de reactividad granular que mejora el rendimiento al evitar ciclos de detección de cambios innecesarios. Es una alternativa más simple y performante que patrones más pesados como NgRx para casos de estado no complejos, y está integrado en el core del framework.

### 2.3. Detección de Cambios Zoneless

La aplicación está configurada con `provideZonelessChangeDetection()`.

- **Decisión Técnica:** Desacoplar la detección de cambios de `NgZone` para obtener un control más fino y un rendimiento superior. En una aplicación basada en `signals`, `zone.js` ya no es un requisito indispensable.

### 2.4. Estructura del Proyecto

El proyecto sigue una estructura clara por funcionalidad para facilitar la mantenibilidad:

- `src/app/guards`: Lógica de protección de rutas.
- `src/app/interceptors`: Lógica para interceptar y modificar peticiones/respuestas HTTP.
- `src/app/interfaces`: Definiciones de tipos y modelos de datos.
- `src/app/pages`: Componentes "inteligentes" que corresponden a las rutas principales.
- `src/app/services`: Lógica de negocio y comunicación con APIs.

---

## 3. Flujo de Autenticación Detallado

### 3.1. Estrategia de Tokens JWT (Access + Refresh)

Se implementó un flujo de autenticación JWT dual para maximizar la seguridad y la UX.

1.  **Login:** Al iniciar sesión, la API devuelve un `accessToken` (de corta duración) y un `refreshToken` (de larga duración). Ambos se almacenan en `localStorage`.
2.  **Peticiones a API:** El `accessToken` se envía en la cabecera `Authorization` de cada petición a rutas protegidas.
3.  **Expiración del Token:** Cuando el `accessToken` expira, la API devuelve un error `401 Unauthorized`.
4.  **Renovación Silenciosa:** Un interceptor HTTP captura este error `401` y utiliza el `refreshToken` para solicitar un nuevo par de tokens de forma silenciosa, sin interrumpir al usuario.
5.  **Expiración de Sesión:** Si el `refreshToken` también es inválido o ha expirado, la sesión se considera terminada y se redirige al usuario a la página de login.

### 3.2. Interceptor HTTP (`auth.interceptor.ts`)

Este es el núcleo de la estrategia de renovación de tokens.

- **Decisión Técnica:** Implementar un interceptor global (`HttpInterceptorFn`) para centralizar la lógica de autenticación.
- **Manejo de Concurrencia:** El interceptor está diseñado para manejar el caso en que múltiples peticiones fallen simultáneamente con un `401`. Utiliza un `BehaviorSubject` y un flag `isRefreshing` para asegurar que la petición de `refreshToken` se realice solo una vez. Las peticiones fallidas subsiguientes se "enfilan" y esperan a que el nuevo token esté disponible antes de reintentarse. Esto previene condiciones de carrera y múltiples llamadas innecesarias al endpoint de refresh.

### 3.3. Inicialización de la Aplicación (`APP_INITIALIZER`)

Para mantener la sesión del usuario persistente entre recargas de página.

- **Decisión Técnica:** Se utiliza el token de inyección `APP_INITIALIZER`. Este ejecuta el método `authService.checkAuthStatus()` durante el arranque de la aplicación. Este método verifica si existe un token válido en `localStorage`, y si es así, obtiene los datos del usuario para "hidratar" el estado de la aplicación antes de que se renderice la primera vista.

---

## 4. Routing y Protección de Rutas

### 4.1. Carga Perezosa (Lazy Loading)

Todas las rutas se cargan de forma perezosa utilizando `loadComponent`.

- **Decisión Técnica:** Mejora drásticamente el tiempo de carga inicial de la aplicación, ya que el código de cada página solo se descarga cuando el usuario navega a ella.

### 4.2. Guardianes de Rutas (`CanActivateFn`)

Se implementaron dos guardianes para un control de acceso robusto:

1.  **`auth.guard.ts`:** Protege las rutas privadas (ej. `/dashboard`). Verifica si el usuario está autenticado. Si no, cancela la navegación y redirige a `/login`.
2.  **`public.guard.ts`:** Protege las rutas públicas (ej. `/login`, `/register`). Si un usuario ya autenticado intenta acceder, es redirigido automáticamente al `/dashboard`, mejorando la UX.

---

## 5. UI y Experiencia de Usuario

### 5.1. Angular Material

Se utilizó la librería de componentes Angular Material para asegurar una UI consistente, accesible y de alta calidad con un esfuerzo de desarrollo reducido.

### 5.2. Manejo Global de Errores

- **Decisión Técnica:** Se creó un `NotificationService` que abstrae la lógica del `MatSnackBar` de Angular Material. El `AuthService` utiliza este servicio para mostrar notificaciones claras y consistentes al usuario en caso de errores (ej. "Credenciales inválidas"), en lugar de fallos silenciosos en la consola.

### 5.3. Formularios Reactivos

El formulario de login utiliza `ReactiveFormsModule`.

- **Decisión Técnica:** Proporciona un modelo robusto y escalable para la gestión de formularios complejos, facilitando la validación síncrona/asíncrona y el seguimiento del estado del formulario.

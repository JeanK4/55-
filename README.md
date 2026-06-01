# Club55

Plataforma web orientada a adultos mayores que permite descubrir, reservar y gestionar actividades recreativas, culturales, educativas y de bienestar. Además, facilita la interacción entre adultos mayores, cuidadores y proveedores de servicios.

---

## Descripción

Club55 es una aplicación web desarrollada para promover la participación social y el bienestar de los adultos mayores mediante una interfaz sencilla e intuitiva.

La plataforma permite:

* Consultar actividades disponibles.
* Realizar reservas.
* Gestionar reservas activas e historial.
* Vincular cuidadores con adultos mayores.
* Administrar actividades por parte de proveedores.
* Recibir notificaciones y mensajes.
* Acceder a contenido de salud y entretenimiento.

---

## Tecnologías utilizadas

* Next.js 14
* React
* TypeScript
* Tailwind CSS
* LocalStorage para persistencia de datos
* Lucide React (iconografía)

---

## Roles del sistema

### Adulto Mayor

Puede:

* Explorar actividades.
* Realizar reservas.
* Cancelar reservas.
* Consultar historial.
* Acceder a contenido de bienestar.

### Cuidador

Puede:

* Consultar las reservas del adulto mayor vinculado.
* Supervisar actividades.
* Consultar historial de participación.

### Proveedor

Puede:

* Crear actividades.
* Editar actividades existentes.
* Cancelar actividades.
* Consultar participantes inscritos.

---

## Funcionalidades principales

### Gestión de actividades

* Visualización de actividades disponibles.
* Clasificación por categorías.
* Consulta de información detallada.
* Gestión de cupos.

### Sistema de reservas

* Reserva de actividades.
* Cancelación de reservas.
* Historial de participación.
* Lista de espera.

### Gestión de usuarios

* Registro de usuarios.
* Inicio de sesión.
* Administración de perfiles.
* Vinculación cuidador–adulto mayor.

### Notificaciones

* Confirmaciones de reserva.
* Cancelaciones.
* Actualizaciones de actividades.

---

## Estructura del proyecto

```text
src/
│
├── app/
│   ├── actividades/
│   ├── login/
│   ├── perfil/
│   ├── mis-reservas/
│   ├── mensajes/
│   └── salud/
│
├── components/
│
├── lib/
│   ├── store.ts
│   ├── types.ts
│   └── format.ts
│
└── styles/
```

---

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/usuario/club55.git
```

Ingresar al proyecto:

```bash
cd club55
```

Instalar dependencias:

```bash
npm install
```

Ejecutar en modo desarrollo:

```bash
npm run dev
```

Abrir en el navegador:

```text
http://localhost:3000
```

---

## Construcción para producción

Generar la versión optimizada:

```bash
npm run build
```

Ejecutar producción:

```bash
npm start
```

---

## Cuentas de prueba

### Adulto Mayor

```text
maria@club55.demo
```

### Cuidador

```text
laura@club55.demo
```

### Proveedor

```text
tertulia@club55.demo
```

---

## Almacenamiento de datos

Actualmente la aplicación utiliza LocalStorage para almacenar:

* Usuarios
* Actividades
* Reservas
* Notificaciones
* Mensajes
* Vinculaciones entre usuarios

No requiere base de datos externa para su funcionamiento.

---

## Autores

Proyecto desarrollado como parte de una actividad académica para la gestión de actividades y bienestar de adultos mayores.

---

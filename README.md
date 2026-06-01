# Club 55+ — Sprint 1

Prototipo funcional del sistema **Club 55+** desarrollado con **Next.js 14 + TypeScript + Tailwind CSS** como parte del curso *Procesos y Diseño de Software* — Pontificia Universidad Javeriana Cali, 2026-1.

---

## Funcionalidades incluidas (Sprint 1)

| RF | Funcionalidad | Estado |
|----|---------------|--------|
| RF-11 | Registro e inicio de sesión (sin contraseña) | ✅ |
| RF-03 | Perfil + verificación de edad ≥ 55 (R-1) | ✅ |
| RF-12 | Roles diferenciados: Adulto Mayor / Proveedor | ✅ |
| RF-04 | Proveedor publica y gestiona actividades | ✅ |
| RF-02 | Visualización detallada de actividades | ✅ |
| RF-01 | Búsqueda y filtrado (texto + categoría + cupos) | ✅ |
| RF-05 | Reserva y cancelación de cupos | ✅ |
| RF-06 | Historial de reservas (activas + pasadas) | ✅ |

---

## Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar en modo desarrollo
npm run dev

# 3. Abrir en el navegador
# http://localhost:3000
```

---

## Cuentas de prueba

Inicia sesión con cualquiera de estas cuentas demo (solo con el correo):

| Correo | Rol |
|--------|-----|
| `tertulia@club55.demo` | Proveedor |
| `bienestar@club55.demo` | Proveedor |
| `acuaparque@club55.demo` | Proveedor |

O **crea una cuenta nueva** como adulto mayor desde `/registro`.

---

## Estructura del proyecto

```
src/
├── app/                        # Páginas Next.js (App Router)
│   ├── page.tsx                # Landing page
│   ├── login/page.tsx          # Inicio de sesión (RF-11)
│   ├── registro/page.tsx       # Registro + verificación edad (RF-03, R-1)
│   ├── actividades/
│   │   ├── page.tsx            # Listado y búsqueda (RF-01, RF-02)
│   │   └── [id]/page.tsx       # Detalle + reserva (RF-05)
│   ├── mis-reservas/page.tsx   # Historial de reservas (RF-06)
│   └── proveedor/
│       ├── page.tsx            # Dashboard del proveedor (RF-04)
│       └── nueva-actividad/    # Crear actividad (RF-04)
├── components/
│   ├── AuthProvider.tsx        # Context de autenticación
│   ├── NavBar.tsx              # Navegación principal
│   └── ActividadCard.tsx       # Tarjeta de actividad reutilizable
├── lib/
│   ├── types.ts                # Tipos de dominio (SRS sección 4.1)
│   ├── store.ts                # Capa de datos (localStorage → reemplazar por API REST)
│   └── format.ts               # Helpers de formato en español
└── data/
    └── seed.ts                 # Datos demo de actividades y proveedores
```

---

## Decisiones técnicas

- **Persistencia**: `localStorage` en el cliente. La capa `src/lib/store.ts` está diseñada como una abstracción que en el Sprint 2 se reemplaza por llamadas al API REST (Spring Boot), sin cambios en las páginas.
- **Sin autenticación real**: El Sprint 1 no implementa contraseña. La autenticación OAuth (Google/Facebook) y JWT se implementarán en el Sprint 2 (RF-11 completo).
- **Tipografía**: DM Serif Display + Plus Jakarta Sans — tipografías accesibles para adultos mayores.
- **Accesibilidad**: Botones con área mínima de 48px (WCAG 2.1), contraste alto, foco visible (RNF-01, RNF-02).

---

## Próximo Sprint

- [ ] Autenticación real con contraseña / OAuth (RF-11)
- [ ] Sistema de notificaciones (RF-08)
- [ ] Recomendaciones personalizadas (RF-07)
- [ ] Mensajería usuario–proveedor (RF-09)
- [ ] Calificación y comentarios (RF-10)
- [ ] Cuidador vinculado (RF-12)
- [ ] Calendario de actividades (RF-16)

---

*Metodología: Rational Unified Process (RUP) · Modelado: UML · Javeriana Cali 2026-1*

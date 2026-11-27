# Panify — Frontend

> **"Horneamos Calidad, Entregamos Confianza y Unimos Lazos"**

Aplicación cliente de **Panify**, el sistema de gestión de pedidos, inventario y entregas de la panadería **Distribuciones Oro Pan**. Ofrece una interfaz pública (landing, catálogo, registro e inicio de sesión), un área para clientes y un panel de administración.

---

## 📌 Contexto

| | |
|---|---|
| **Cliente / caso de estudio** | Fabrica de Pan "Distribuciones Oro Pan" |
| **Programa** | SENA — Análisis y Desarrollo de Software (ADSO) |
| **Ficha / Grupo** | 3315796 / Grupo 4 |

**Problema:** los pedidos se toman de forma manual (llamadas y papel), lo que genera pérdida de información, retrasos y falta de comprobantes claros. El frontend ofrece una interfaz web para hacer pedidos, consultar recibos y gestionar la operación.

---

## 🎯 Funcionalidades

| Área | Qué ofrece |
|---|---|
| **Pública** | Landing page con navegación (Inicio, Nosotros, Productos, Contacto, Ingresar), catálogo público de productos, registro de nuevos clientes, inicio de sesión y recuperación de contraseña. |
| **Cliente** | Realizar pedidos mediante carrito de compras, consultar el historial en *Mis pedidos*, visualizar recibos digitales y gestionar el perfil personal (dirección de entrega y teléfono). |
| **Panadero** | **Panel de Producción:** CRUD completo de productos (crear, editar, activar/desactivar), control e ingreso de stock de inventario, consulta de pedidos programados por fecha/día para producción, y cambio de estado del pedido (*Pendiente* ➔ *En preparación* ➔ *Listo*).|
| **Domiciliario** |**Panel de Entregas:** Visualización de pedidos asignados ordenados por prioridad y franja horaria, consulta de detalles del cliente (dirección y barrio), actualización del estado del despacho (*Listo* ➔ *En camino* ➔ *Entregado*) y consulta de rutas de entrega.|
| **Administración** | **Dashboard Global:** Control total del sistema (CRUD de usuarios, asignación de roles y activación/inactivación de cuentas), monitoreo general de inventario con alertas de stock bajo/agotado, gestión global de pedidos y recibos, y generación de reportes operativos (diarios, semanales y mensuales). |


---

## 🛠️ Tecnologías

| Componente | Tecnología |
| :--- | :--- |
| Librería de UI | React |
| Herramienta de desarrollo y build | Vite |
| Maquetación | HTML5 semántico |
| Estilos | Tailwind CSS 4 (diseño de `Mockup_Panify`) + CSS global en `src/assets/css/main.css` |
| Iconos | lucide-react |
| Enrutamiento | React Router |
| Comunicación con el backend | Capa de servicios (`src/services/`) |
| Control de versiones | Git y GitHub |

---

## 📁 Estructura del proyecto

```
📁 Panify-Frontend/
├── 📁 public/img/                 # Logotipo y favicon
└── 📁 src/
    ├── 📁 assets/                 # Imágenes locales y css/main.css (Tailwind + tema Panify)
    ├── 📁 components/
    │   ├── 📁 common/             # ui.jsx (botones, modales, badges…), BellPopover, ProtectedRoute
    │   └── 📁 client/             # Timeline de estados del pedido
    ├── 📁 hooks/                  # useSesion, useCarrito, useApariencia, useNotificaciones
    ├── 📁 layouts/                # AdminLayout (sidebar) y ClientLayout (barra superior)
    ├── 📁 pages/
    │   ├── 📁 public/             # Home (landing), Login, Register, Recuperacion
    │   ├── 📁 client/             # Inicio, Catalogo, Carrito, Pedidos, Recibos
    │   ├── 📁 admin/              # Dashboard, Inventario, Pedidos, Recibos, Entregas, Domiciliario, Users
    │   └── 📁 shared/             # Configuracion (apariencia y perfil)
    ├── 📁 routes/                 # AppRouter con rutas protegidas por rol
    ├── 📁 services/               # Axios compartido (api.js) y llamadas al backend
    └── 📁 utils/                  # formatos.js y adaptadores.js (datos de la API → vistas)
```

## 🚀 Instalación y ejecución

### Requisitos

- Node.js
- Git

### Pasos

```bash
# 1. Clonar el repositorio
git clone <URL-del-repositorio>
cd frontend

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo desarrollo
npm run dev
```

### Conexión con el backend

El frontend se ejecuta en `http://localhost:5173` y Vite reenvía las solicitudes
de la API al backend en `http://127.0.0.1:8000`. Esto evita errores de CORS
durante el desarrollo. Los servicios solicitan rutas como `/health`,
`/productos` y `/pedidos`; las rutas de autenticación usan `/api/v1/auth`.

En producción, configura `VITE_API_URL` con la URL pública del backend y permite
el origen del frontend en la configuración CORS del backend.

---

## 🌿 Flujo de trabajo en Git

### Ramas de trabajo (Feature Branches)

```
chore/setup-base-ui
feature/auth-login
feature/gestion-usuarios
feature/gestion-productos
feature/gestion-pedidos
feature/gestion-recibos
feature/gestion-entregas
```

### Commits semánticos

Formato: `<tipo>(<ámbito>): <descripción en imperativo y minúsculas, máx. 50 caracteres>`

- **Tipos:** `feat`, `docs`, `style`, `refactor`, `chore`
- **Ámbitos comunes:** `ui`, `repo`, `admin`, `cliente`, `trimestre3`

Ejemplos:

```
docs(repo): agregar readme inicial del frontend
feat(ui): crear componente navbar responsivo
style(ui): definir variables globales de color
```

---

## 👥 Equipo

- Brayan Sneyder Devia Muñoz
- Martín Cruz Muñoz
- Jeison Alejandro Diaz Acosta
- Brandon Duvan Guevara Rodríguez
- Kevin Julian González Chavez

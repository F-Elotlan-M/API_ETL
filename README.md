# API para Gestión de ETLs y Permisos de Usuario

Esta API permite la gestión de usuarios, ETLs (Extract, Transform, Load processes), y los permisos que los usuarios tienen para consultar dichos ETLs.

## Tabla de Contenidos
- [Prerrequisitos](#prerrequisitos)
- [Instalación](#instalación)
- [Configuración del Entorno](#configuración-del-entorno)
- [Configuración de la Base de Datos](#configuración-de-la-base-de-datos)
- [Ejecutar la Aplicación](#ejecutar-la-aplicación)
- [Scripts Útiles](#scripts-útiles)
- [Endpoints de la API](#endpoints-de-la-api)
- [Pruebas de la API](#pruebas-de-la-api)
  - [Herramientas Recomendadas](#herramientas-recomendadas)
  - [Generación de Token JWT para Pruebas (Administrador)](#generación-de-token-jwt-para-pruebas-administrador)
- [Estructura del Proyecto](#estructura-del-proyecto)

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

* **Node.js**: Versión `^22.x.x` o compatible (la versión `v22.15.1` fue usada durante el desarrollo). Puedes descargarlo desde [nodejs.org](https://nodejs.org/).
* **npm**: Generalmente se instala junto con Node.js.
* **PostgreSQL**: Un servidor de base de datos PostgreSQL instalado y corriendo. Puedes descargarlo desde [postgresql.org](https://www.postgresql.org/download/).

## Instalación

1.  **Clona el repositorio** (si está en un repositorio Git):
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd <NOMBRE_DE_LA_CARPETA_DEL_PROYECTO>
    ```
    Si no está en Git, simplemente asegúrate de tener los archivos del proyecto en una carpeta.

2.  **Navega al directorio del proyecto:**
    ```bash
    cd API_ETL 
    ```
    (O el nombre que le hayas dado a tu carpeta de proyecto).

3.  **Instala las dependencias del proyecto:**
    ```bash
    npm install
    ```

## Configuración del Entorno

Este proyecto utiliza variables de entorno para configuraciones sensibles y específicas del entorno.

1.  **Crea un archivo `.env`** en la raíz del proyecto (al mismo nivel que `package.json`).
2.  Usa la siguiente plantilla y **reemplaza los placeholders** con tus valores reales:

    ```env
    # Archivo: .env

    # Configuración del Servidor
    PORT=3000

    # Configuración de la Base de Datos PostgreSQL
    DB_USER="TU_USUARIO_POSTGRES"
    DB_PASS="TU_CONTRASENA_POSTGRES"
    DB_NAME="etl_db" 
    DB_HOST="localhost" # o 127.0.0.1
    DB_PORT="5432"

    # URL de conexión completa para Sequelize CLI
    DATABASE_URL_DEV="postgres://TU_USUARIO_POSTGRES:TU_CONTRASENA_POSTGRES@localhost:5432/etl_db"
    # DATABASE_URL_TEST="postgres://TU_USUARIO_POSTGRES:TU_CONTRASENA_POSTGRES@localhost:5432/etl_db_test" # Para entorno de pruebas
    # DATABASE_URL_PROD="postgres://USUARIO_PROD:CONTRASENA_PROD@HOST_PROD:PUERTO_PROD/NOMBRE_BD_PROD" # Para entorno de producción

    # Secreto para JWT (JSON Web Tokens)
    # ¡IMPORTANTE! Genera una cadena ÚNICA, LARGA y SEGURA para producción.
    JWT_SECRET="TU_SUPER_SECRETO_JWT_MUY_LARGO_Y_COMPLEJO_AQUI"
    ```

    * **`TU_USUARIO_POSTGRES`**: Tu nombre de usuario de PostgreSQL.
    * **`TU_CONTRASENA_POSTGRES`**: Tu contraseña de PostgreSQL.
    * **`etl_db`**: El nombre de la base de datos que usarás.
    * **`JWT_SECRET`**: Una cadena aleatoria, larga y segura.

## Configuración de la Base de Datos

1.  **Asegúrate de que tu servidor PostgreSQL esté corriendo.**
2.  **Crea la base de datos** (ej. `etl_db`) si aún no existe:
    ```sql
    CREATE DATABASE etl_db;
    ```
3.  **Ejecuta las migraciones** para crear las tablas (`Usuarios`, `ETLs`, `Permisos`, y la columna `rol` en `Usuarios`):
    ```bash
    npm run db:migrate
    ```
4.  **(Opcional) Poblar con datos iniciales (Seeders):**
    ```bash
    npm run db:seed:all
    ```

## Ejecutar la Aplicación

1.  **Para desarrollo:**
    ```bash
    npm run dev
    ```
2.  **Para producción:**
    ```bash
    npm start
    ```
La API estará disponible en `http://localhost:3000` (o el puerto configurado).

## Scripts Útiles

* `npm run dev`: Inicia el servidor en modo desarrollo con Nodemon.
* `npm start`: Inicia el servidor.
* `npm run db:migrate`: Aplica migraciones.
* `npm run db:migrate:status`: Muestra estado de migraciones.
* `npm run db:migrate:undo`: Revierte la última migración.
* `npm run db:migrate:undo:all`: Revierte todas las migraciones.
* `npm run db:seed:all`: Ejecuta todos los seeders.

## Endpoints de la API

Todos los endpoints que gestionan datos o permisos requieren un Token JWT de Administrador en el header `Authorization: Bearer <TOKEN>`.

### Autenticación (A ser implementado)
* `POST /api/auth/login`: (Pendiente) Iniciar sesión para obtener un token JWT.

### Usuarios (`/api/usuarios`)
* **`POST /`**: Agregar un nuevo usuario y asignarle ETLs. (CU-01)
    * **Body**: `{ "nombreUsuario": "string", "etlIds": [integer] }`
    * Requiere rol: Administrador.
* **`GET /`**: Listar todos los usuarios. (CU-02)
    * Requiere rol: Administrador.
* **`GET /{idUsuario}/permisos`**: Obtener los permisos (ETLs asignados) de un usuario específico. (CU-02)
    * Requiere rol: Administrador.
* **`PUT /{idUsuario}/permisos`**: Actualizar la lista completa de ETLs asignados a un usuario específico. (CU-02)
    * **Body**: `{ "etlIds": [integer] }` (un array vacío `[]` quita todos los permisos).
    * Requiere rol: Administrador.

### ETLs (`/api/etls`)
* **`GET /`**: Listar todos los ETLs disponibles. (CU-02)
    * Requiere rol: Administrador.

## Pruebas de la API

### Herramientas Recomendadas
Puedes usar herramientas como:
* [Insomnia](https://insomnia.rest/) (GUI)
* [Postman](https://www.postman.com/) (GUI)
* Thunder Client (Extensión de VS Code)
* `curl` (Línea de comandos)
* `httpie` (Línea de comandos)

### Generación de Token JWT para Pruebas (Administrador)

Dado que el endpoint de Login aún no está implementado, necesitarás generar manualmente un token JWT para probar los endpoints protegidos que requieren rol de "Administrador".

**1. Asegurar un Usuario Administrador en la Base de Datos:**
   La tabla `Usuarios` tiene una columna `rol`. Necesitas un usuario con `rol = 'Administrador'`.
   * Si acabas de crear la base de datos, la tabla `Usuarios` estará vacía o los usuarios existentes tendrán `rol = NULL` (o el valor por defecto si lo configuraste).
   * Puedes crear un usuario (si la tabla está vacía) y/o actualizar un usuario existente directamente en la base de datos usando SQL. Por ejemplo, para actualizar el usuario con `id = 1`:
     ```sql
     -- Conéctate a tu base de datos 'etl_db'
     UPDATE "Usuarios" SET rol = 'Administrador' WHERE id = 1;
     -- Si no existe el usuario con id=1, puedes insertarlo primero:
     -- INSERT INTO "Usuarios" (nombre, rol, "createdAt", "updatedAt") VALUES ('admin_user', 'Administrador', NOW(), NOW());
     -- Luego anota su ID.
     ```
   Asegúrate de que el usuario que elijas para generar el token tenga este rol.

**2. Crear el Script `generateToken.js`:**
   Crea un archivo llamado `generateToken.js` en la raíz de tu proyecto (`mi_api_etl/generateToken.js`) con el siguiente contenido:

   ```javascript
   // mi_api_etl/generateToken.js
   require('dotenv').config(); // Carga JWT_SECRET desde .env
   const jwt = require('jsonwebtoken');

   const JWT_SECRET = process.env.JWT_SECRET;

   if (!JWT_SECRET) {
     console.error("Error: JWT_SECRET no está definido en tu archivo .env.");
     console.error("Asegúrate de tener una variable JWT_SECRET con un valor seguro.");
     process.exit(1);
   }

   // -------- CONFIGURA ESTE PAYLOAD --------
   const adminUserPayload = {
     id: 1,                            // Reemplaza con el ID del usuario que marcaste como Administrador
     nombre: 'nombre_del_admin_en_bd', // Reemplaza con el nombre del usuario admin
     rol: 'Administrador'              // Este rol debe coincidir con el que espera tu middleware
   };
   // --------------------------------------

   const tokenOptions = {
     expiresIn: '24h' // El token será válido por 24 horas (puedes ajustarlo)
   };

   try {
     const token = jwt.sign(adminUserPayload, JWT_SECRET, tokenOptions);
     console.log('--- Token JWT Generado para Administrador ---');
     console.log('Válido por:', tokenOptions.expiresIn);
     console.log('Token:');
     console.log(token);
     console.log('-------------------------------------------');
     console.log('Copia el token y úsalo en el header "Authorization: Bearer <token>" de tus solicitudes API.');
   } catch (error) {
     console.error("Error al generar el token:", error.message);
   }

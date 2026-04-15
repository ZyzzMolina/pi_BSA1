# Diccionario de Datos — Sistema Académico

## Tabla: `alumnos`
| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id_alumno | SERIAL | PK | Identificador único del alumno |
| nombre | VARCHAR(100) | NOT NULL | Nombre(s) del alumno |
| apellido | VARCHAR(100) | NOT NULL | Apellido(s) del alumno |
| email | VARCHAR(150) | NOT NULL, UNIQUE | Correo electrónico institucional |
| telefono | VARCHAR(20) | — | Teléfono de contacto |
| fecha_nac | DATE | — | Fecha de nacimiento |
| direccion | VARCHAR(255) | — | Dirección del alumno |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación del registro |

## Tabla: `docentes`
| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id_docente | SERIAL | PK | Identificador único del docente |
| nombre | VARCHAR(100) | NOT NULL | Nombre(s) del docente |
| apellido | VARCHAR(100) | NOT NULL | Apellido(s) del docente |
| email | VARCHAR(150) | NOT NULL, UNIQUE | Correo electrónico institucional |
| telefono | VARCHAR(20) | — | Teléfono de contacto |
| especialidad | VARCHAR(100) | — | Área de especialización |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación del registro |

## Tabla: `materias`
| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id_materia | SERIAL | PK | Identificador único de la materia |
| nombre | VARCHAR(100) | NOT NULL | Nombre de la materia |
| clave | VARCHAR(20) | NOT NULL, UNIQUE | Clave institucional (ej: BDA-401) |
| creditos | INT | NOT NULL, CHECK (> 0) | Número de créditos |
| descripcion | TEXT | — | Descripción de la materia |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación del registro |

## Tabla: `grupos`
| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id_grupo | SERIAL | PK | Identificador único del grupo |
| id_materia | INT | FK → materias, NOT NULL | Materia asignada al grupo |
| id_docente | INT | FK → docentes, NOT NULL | Docente asignado al grupo |
| periodo | VARCHAR(20) | NOT NULL | Periodo escolar (ej: 2026-1) |
| horario | VARCHAR(100) | — | Horario del grupo |
| aula | VARCHAR(50) | — | Aula asignada |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación del registro |

## Tabla: `inscripciones`
| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id_inscripcion | SERIAL | PK | Identificador único de la inscripción |
| id_alumno | INT | FK → alumnos, NOT NULL | Alumno inscrito |
| id_grupo | INT | FK → grupos, NOT NULL | Grupo al que se inscribe |
| fecha | DATE | DEFAULT CURRENT_DATE | Fecha de inscripción |
| estado | VARCHAR(20) | DEFAULT 'Activa' | Estado de la inscripción |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación del registro |

> Restricción UNIQUE en (id_alumno, id_grupo): evita inscripciones duplicadas.

## Tabla: `calificaciones`
| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id_calificacion | SERIAL | PK | Identificador único |
| id_inscripcion | INT | FK → inscripciones, NOT NULL | Inscripción evaluada |
| calificacion | NUMERIC(5,2) | CHECK (0-100) | Calificación numérica |
| periodo_eval | VARCHAR(50) | NOT NULL | Periodo de evaluación (Parcial 1, Final, etc.) |
| fecha_registro | DATE | DEFAULT CURRENT_DATE | Fecha en que se registró |
| observaciones | TEXT | — | Comentarios del docente |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación del registro |

---

## Roles y Permisos

| Rol | Permisos |
|---|---|
| `rol_admin` | ALL PRIVILEGES en todas las tablas, secuencias, funciones y procedimientos |
| `rol_docente` | SELECT en alumnos, inscripciones, grupos, materias. SELECT/INSERT/UPDATE en calificaciones. SELECT en vistas. EXECUTE en funciones. |
| `rol_alumno` | SELECT en alumnos, inscripciones, calificaciones, grupos, materias. SELECT en vistas. EXECUTE en funciones. |

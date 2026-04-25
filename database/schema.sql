-- ============================================================
-- SISTEMA ACADÉMICO CON CONTROL POR ROLES
-- Universidad Politécnica de Querétaro
-- Ingeniería en TI e Innovación Digital
-- Base de Datos Avanzadas — Proyecto Final
-- ============================================================
-- Motor: PostgreSQL 15+
-- Encoding: UTF-8
-- Ejecutar como superusuario (postgres)
-- ============================================================

-- ============================
-- 0. CREAR BASE DE DATOS
-- ============================
-- DROP DATABASE IF EXISTS sistema_academico_db;
-- CREATE DATABASE sistema_academico_db ENCODING 'UTF8' LC_COLLATE 'es_ES.UTF-8' LC_CTYPE 'es_ES.UTF-8';
-- \c sistema_academico_db

-- ============================
-- 1. LIMPIEZA PREVIA
-- ============================
DROP TRIGGER IF EXISTS trg_validar_calificacion ON calificaciones;
DROP FUNCTION IF EXISTS fn_trg_validar_calificacion() CASCADE;
DROP FUNCTION IF EXISTS fn_promedio_alumno(INT) CASCADE;
DROP FUNCTION IF EXISTS fn_estatus_alumno(INT) CASCADE;
DROP PROCEDURE IF EXISTS sp_registrar_calificacion(INT, INT, NUMERIC) CASCADE;
DROP PROCEDURE IF EXISTS sp_consultar_desempeno(INT) CASCADE;
DROP PROCEDURE IF EXISTS sp_inscribir_alumno(INT, INT) CASCADE;
DROP VIEW IF EXISTS vista_historial CASCADE;
DROP VIEW IF EXISTS vista_promedios CASCADE;

DROP TABLE IF EXISTS calificaciones CASCADE;
DROP TABLE IF EXISTS inscripciones CASCADE;
DROP TABLE IF EXISTS periodos_docente CASCADE;
DROP TABLE IF EXISTS grupos CASCADE;
DROP TABLE IF EXISTS materias CASCADE;
DROP TABLE IF EXISTS docentes CASCADE;
DROP TABLE IF EXISTS alumnos CASCADE;

-- ============================
-- 2. CREACIÓN DE TABLAS
-- ============================

-- Tabla: alumnos
CREATE TABLE alumnos (
    id_alumno   SERIAL       PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    apellido    VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,  -- Restricción UNIQUE
    telefono    VARCHAR(20),
    fecha_nac   DATE,
    direccion   VARCHAR(255),
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: docentes
CREATE TABLE docentes (
    id_docente  SERIAL       PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    apellido    VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    telefono    VARCHAR(20),
    especialidad VARCHAR(100),
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: periodos_docente
CREATE TABLE periodos_docente (
    id_periodo_docente SERIAL   PRIMARY KEY,
    id_docente         INT      NOT NULL REFERENCES docentes(id_docente) ON DELETE CASCADE,
    periodo            VARCHAR(20) NOT NULL,          -- Ej: 'Parcial 1', 'Parcial 2', 'Final'
    activo             BOOLEAN  DEFAULT TRUE,
    fecha_activacion   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_docente, periodo)                      -- Un docente no puede tener el mismo período duplicado
);

-- Tabla: materias
CREATE TABLE materias (
    id_materia  SERIAL       PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,          -- Restricción NOT NULL
    clave       VARCHAR(20)  NOT NULL UNIQUE,
    creditos    INT          NOT NULL CHECK (creditos > 0),
    descripcion TEXT,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: grupos
CREATE TABLE grupos (
    id_grupo    SERIAL       PRIMARY KEY,
    id_materia  INT          NOT NULL REFERENCES materias(id_materia) ON DELETE CASCADE,
    id_docente  INT          NOT NULL REFERENCES docentes(id_docente) ON DELETE CASCADE,
    periodo     VARCHAR(20)  NOT NULL,          -- Ej: '2026-1'
    horario     VARCHAR(100),
    aula        VARCHAR(50),
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: inscripciones
CREATE TABLE inscripciones (
    id_inscripcion SERIAL    PRIMARY KEY,
    id_alumno      INT       NOT NULL REFERENCES alumnos(id_alumno) ON DELETE CASCADE,
    id_grupo       INT       NOT NULL REFERENCES grupos(id_grupo) ON DELETE CASCADE,
    fecha          DATE      DEFAULT CURRENT_DATE,   -- Restricción DEFAULT CURRENT_DATE
    estado         VARCHAR(20) DEFAULT 'Activa',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_alumno, id_grupo)                      -- Un alumno no puede inscribirse dos veces al mismo grupo
);

-- Tabla: calificaciones
CREATE TABLE calificaciones (
    id_calificacion SERIAL   PRIMARY KEY,
    id_inscripcion  INT      NOT NULL REFERENCES inscripciones(id_inscripcion) ON DELETE CASCADE,
    calificacion    NUMERIC(5,2) CHECK (calificacion BETWEEN 0 AND 100),  -- Restricción CHECK
    periodo_eval    VARCHAR(50)  NOT NULL,        -- Ej: 'Parcial 1', 'Parcial 2', 'Final'
    fecha_registro  DATE     DEFAULT CURRENT_DATE,
    observaciones   TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 3. ÍNDICES (con justificación)
-- ============================

-- Índice en alumnos.email: Las búsquedas de login y validación de unicidad
-- se realizan por email. Acelera WHERE email = '...' y el UNIQUE constraint.
CREATE INDEX idx_alumnos_email ON alumnos(email);

-- Índice en docentes.email: Mismo caso que alumnos, se busca por email al autenticarse.
CREATE INDEX idx_docentes_email ON docentes(email);

-- Índice en periodos_docente(id_docente): Se usa para obtener todos los períodos activados
-- para un docente específico.
CREATE INDEX idx_periodos_docente ON periodos_docente(id_docente);

-- Índice en inscripciones(id_alumno): Se usa frecuentemente en JOINs para
-- obtener el historial de un alumno. Acelera las consultas de historial y promedio.
CREATE INDEX idx_inscripciones_alumno ON inscripciones(id_alumno);

-- Índice en inscripciones(id_grupo): Se usa en JOINs con grupos para
-- listar alumnos de un grupo específico.
CREATE INDEX idx_inscripciones_grupo ON inscripciones(id_grupo);

-- Índice en calificaciones(id_inscripcion): Es clave foránea que se usa
-- en cada JOIN para obtener las calificaciones de una inscripción.
CREATE INDEX idx_calificaciones_inscripcion ON calificaciones(id_inscripcion);

-- Índice en grupos(id_materia): Acelera la búsqueda de grupos por materia,
-- utilizado frecuentemente en consultas de historial académico.
CREATE INDEX idx_grupos_materia ON grupos(id_materia);

-- Índice en grupos(id_docente): Acelera consultas de grupos asignados
-- a un docente específico.
CREATE INDEX idx_grupos_docente ON grupos(id_docente);

-- ============================
-- 4. DATOS DE EJEMPLO (20+ inserts por tabla)
-- ============================

-- ---- ALUMNOS (25 registros) ----
INSERT INTO alumnos (nombre, apellido, email, telefono, fecha_nac, direccion) VALUES
('Carlos', 'Hernández', 'carlos.hernandez@upq.edu.mx', '4421001001', '2003-03-15', 'Av. Universidad 101'),
('María', 'López', 'maria.lopez@upq.edu.mx', '4421001002', '2004-07-22', 'Calle Juárez 202'),
('Juan', 'García', 'juan.garcia@upq.edu.mx', '4421001003', '2003-11-08', 'Blvd. Central 303'),
('Ana', 'Martínez', 'ana.martinez@upq.edu.mx', '4421001004', '2004-01-30', 'Col. Centro 404'),
('Pedro', 'Rodríguez', 'pedro.rodriguez@upq.edu.mx', '4421001005', '2003-05-12', 'Av. Tecnológico 505'),
('Lucía', 'Sánchez', 'lucia.sanchez@upq.edu.mx', '4421001006', '2004-09-18', 'Calle Hidalgo 606'),
('Miguel', 'Ramírez', 'miguel.ramirez@upq.edu.mx', '4421001007', '2003-02-25', 'Fracc. Industrial 707'),
('Sofía', 'Torres', 'sofia.torres@upq.edu.mx', '4421001008', '2004-06-14', 'Col. Jardines 808'),
('Diego', 'Flores', 'diego.flores@upq.edu.mx', '4421001009', '2003-12-03', 'Av. Constitución 909'),
('Valentina', 'Díaz', 'valentina.diaz@upq.edu.mx', '4421001010', '2004-04-27', 'Calle Morelos 1010'),
('Andrés', 'Moreno', 'andres.moreno@upq.edu.mx', '4421001011', '2003-08-09', 'Blvd. Querétaro 1111'),
('Camila', 'Jiménez', 'camila.jimenez@upq.edu.mx', '4421001012', '2004-10-21', 'Col. Lomas 1212'),
('Fernando', 'Ruiz', 'fernando.ruiz@upq.edu.mx', '4421001013', '2003-01-16', 'Av. Independencia 1313'),
('Isabella', 'Vargas', 'isabella.vargas@upq.edu.mx', '4421001014', '2004-03-05', 'Fracc. Milenio 1414'),
('Roberto', 'Castro', 'roberto.castro@upq.edu.mx', '4421001015', '2003-07-28', 'Calle Allende 1515'),
('Daniela', 'Ortiz', 'daniela.ortiz@upq.edu.mx', '4421001016', '2004-11-11', 'Col. Real 1616'),
('Alejandro', 'Gutiérrez', 'alejandro.gutierrez@upq.edu.mx', '4421001017', '2003-04-02', 'Av. Zaragoza 1717'),
('Gabriela', 'Mendoza', 'gabriela.mendoza@upq.edu.mx', '4421001018', '2004-08-19', 'Blvd. Américas 1818'),
('Sebastián', 'Herrera', 'sebastian.herrera@upq.edu.mx', '4421001019', '2003-06-30', 'Col. Alameda 1919'),
('Renata', 'Aguilar', 'renata.aguilar@upq.edu.mx', '4421001020', '2004-02-14', 'Calle Reforma 2020'),
('Emilio', 'Medina', 'emilio.medina@upq.edu.mx', '4421001021', '2003-10-07', 'Fracc. Campestre 2121'),
('Paula', 'Cruz', 'paula.cruz@upq.edu.mx', '4421001022', '2004-05-23', 'Av. Corregidora 2222'),
('Mateo', 'Reyes', 'mateo.reyes@upq.edu.mx', '4421001023', '2003-09-16', 'Col. Juriquilla 2323'),
('Regina', 'Peña', 'regina.pena@upq.edu.mx', '4421001024', '2004-12-01', 'Calle Pasteur 2424'),
('Nicolás', 'Fuentes', 'nicolas.fuentes@upq.edu.mx', '4421001025', '2003-03-08', 'Blvd. Bernardo 2525');

-- ---- DOCENTES (22 registros) ----
INSERT INTO docentes (nombre, apellido, email, telefono, especialidad) VALUES
('Dr. Ricardo', 'Vega', 'ricardo.vega@upq.edu.mx', '4422001001', 'Bases de Datos'),
('Dra. Patricia', 'Luna', 'patricia.luna@upq.edu.mx', '4422001002', 'Programación'),
('Dr. Enrique', 'Soto', 'enrique.soto@upq.edu.mx', '4422001003', 'Redes'),
('Mtra. Laura', 'Navarro', 'laura.navarro@upq.edu.mx', '4422001004', 'Matemáticas'),
('Dr. Francisco', 'Campos', 'francisco.campos@upq.edu.mx', '4422001005', 'Inteligencia Artificial'),
('Dra. Carmen', 'Delgado', 'carmen.delgado@upq.edu.mx', '4422001006', 'Seguridad Informática'),
('Mtro. Jorge', 'Ríos', 'jorge.rios@upq.edu.mx', '4422001007', 'Desarrollo Web'),
('Dra. Elena', 'Guerrero', 'elena.guerrero@upq.edu.mx', '4422001008', 'Ingeniería de Software'),
('Dr. Manuel', 'Ibarra', 'manuel.ibarra@upq.edu.mx', '4422001009', 'Sistemas Operativos'),
('Mtra. Rosa', 'Espinoza', 'rosa.espinoza@upq.edu.mx', '4422001010', 'Estadística'),
('Dr. Alberto', 'Cervantes', 'alberto.cervantes@upq.edu.mx', '4422001011', 'Cloud Computing'),
('Dra. Silvia', 'Montes', 'silvia.montes@upq.edu.mx', '4422001012', 'IoT'),
('Mtro. Raúl', 'Palacios', 'raul.palacios@upq.edu.mx', '4422001013', 'Algoritmos'),
('Dra. Adriana', 'Coronado', 'adriana.coronado@upq.edu.mx', '4422001014', 'Diseño UX'),
('Dr. Héctor', 'Zavala', 'hector.zavala@upq.edu.mx', '4422001015', 'Machine Learning'),
('Mtra. Beatriz', 'Lara', 'beatriz.lara@upq.edu.mx', '4422001016', 'Cálculo'),
('Dr. Óscar', 'Miranda', 'oscar.miranda@upq.edu.mx', '4422001017', 'Arquitectura de Software'),
('Dra. Gloria', 'Salazar', 'gloria.salazar@upq.edu.mx', '4422001018', 'Compiladores'),
('Mtro. Sergio', 'Nava', 'sergio.nava@upq.edu.mx', '4422001019', 'DevOps'),
('Dra. Teresa', 'Bautista', 'teresa.bautista@upq.edu.mx', '4422001020', 'Ciberseguridad'),
('Dr. Guillermo', 'Orozco', 'guillermo.orozco@upq.edu.mx', '4422001021', 'Big Data'),
('Mtra. Verónica', 'Contreras', 'veronica.contreras@upq.edu.mx', '4422001022', 'Gestión de Proyectos');

-- ---- MATERIAS (22 registros) ----
INSERT INTO materias (nombre, clave, creditos, descripcion) VALUES
('Base de Datos Avanzadas', 'BDA-401', 6, 'Diseño avanzado de bases de datos relacionales y NoSQL'),
('Programación Orientada a Objetos', 'POO-201', 6, 'Fundamentos de POO con Java/Python'),
('Redes de Computadoras', 'RED-301', 5, 'Protocolos, topologías y configuración de redes'),
('Cálculo Diferencial', 'MAT-101', 5, 'Límites, derivadas y aplicaciones'),
('Inteligencia Artificial', 'IA-501', 6, 'Fundamentos de IA, búsqueda y representación del conocimiento'),
('Seguridad Informática', 'SEG-401', 5, 'Criptografía, protocolos y auditoría de seguridad'),
('Desarrollo Web Full Stack', 'DWF-301', 6, 'Frontend y backend con tecnologías modernas'),
('Ingeniería de Software', 'ISW-301', 5, 'Metodologías ágiles y gestión de proyectos de software'),
('Sistemas Operativos', 'SOP-201', 5, 'Gestión de procesos, memoria y sistemas de archivos'),
('Probabilidad y Estadística', 'PYE-201', 5, 'Distribuciones, inferencia y pruebas de hipótesis'),
('Cloud Computing', 'CLC-401', 5, 'AWS, Azure, arquitectura en la nube'),
('Internet de las Cosas', 'IOT-401', 5, 'Sensores, protocolos IoT y plataformas'),
('Análisis de Algoritmos', 'ALG-301', 6, 'Complejidad, diseño y optimización de algoritmos'),
('Diseño de Interfaces', 'DIU-201', 4, 'UX/UI, usabilidad y prototipado'),
('Machine Learning', 'MLE-501', 6, 'Aprendizaje supervisado, no supervisado y reforzamiento'),
('Cálculo Integral', 'MAT-102', 5, 'Integrales, series y aplicaciones'),
('Arquitectura de Software', 'ARS-401', 5, 'Patrones, microservicios y diseño de sistemas'),
('Compiladores', 'COM-401', 5, 'Análisis léxico, sintáctico y generación de código'),
('DevOps', 'DVO-401', 5, 'CI/CD, contenedores y automatización'),
('Ciberseguridad Aplicada', 'CSA-501', 5, 'Pentesting, análisis de vulnerabilidades'),
('Big Data', 'BGD-501', 6, 'Hadoop, Spark y procesamiento de grandes volúmenes'),
('Gestión de Proyectos de TI', 'GPT-301', 4, 'PMBOK, Scrum y gestión de equipos');

-- ---- GRUPOS (24 registros) ----
INSERT INTO grupos (id_materia, id_docente, periodo, horario, aula) VALUES
(1, 1, '2026-1', 'Lun-Mié 08:00-10:00', 'A-101'),
(2, 2, '2026-1', 'Mar-Jue 10:00-12:00', 'B-202'),
(3, 3, '2026-1', 'Lun-Mié 12:00-14:00', 'C-303'),
(4, 4, '2026-1', 'Mar-Jue 08:00-10:00', 'A-102'),
(5, 5, '2026-1', 'Lun-Mié 14:00-16:00', 'D-404'),
(6, 6, '2026-1', 'Mar-Jue 14:00-16:00', 'E-505'),
(7, 7, '2026-1', 'Lun-Mié 16:00-18:00', 'B-203'),
(8, 8, '2026-1', 'Mar-Jue 16:00-18:00', 'C-304'),
(9, 9, '2026-1', 'Vie 08:00-12:00', 'A-103'),
(10, 10, '2026-1', 'Vie 12:00-16:00', 'D-405'),
(11, 11, '2026-1', 'Lun-Mié 10:00-12:00', 'E-506'),
(12, 12, '2026-1', 'Mar-Jue 12:00-14:00', 'A-104'),
(1, 1, '2025-2', 'Lun-Mié 08:00-10:00', 'A-101'),
(2, 2, '2025-2', 'Mar-Jue 10:00-12:00', 'B-202'),
(3, 3, '2025-2', 'Lun-Mié 12:00-14:00', 'C-303'),
(13, 13, '2026-1', 'Lun-Mié 08:00-10:00', 'B-204'),
(14, 14, '2026-1', 'Mar-Jue 08:00-10:00', 'C-305'),
(15, 15, '2026-1', 'Lun-Mié 10:00-12:00', 'D-406'),
(16, 4, '2026-1', 'Mar-Jue 10:00-12:00', 'A-105'),
(17, 17, '2026-1', 'Lun-Mié 14:00-16:00', 'E-507'),
(18, 18, '2026-1', 'Mar-Jue 14:00-16:00', 'B-205'),
(19, 19, '2026-1', 'Lun-Mié 16:00-18:00', 'C-306'),
(20, 20, '2026-1', 'Mar-Jue 16:00-18:00', 'D-407'),
(21, 21, '2026-1', 'Vie 08:00-12:00', 'E-508');

-- ---- INSCRIPCIONES (30 registros) ----
INSERT INTO inscripciones (id_alumno, id_grupo, fecha, estado) VALUES
(1, 1, '2026-01-15', 'Activa'),
(1, 2, '2026-01-15', 'Activa'),
(1, 4, '2026-01-15', 'Activa'),
(2, 1, '2026-01-15', 'Activa'),
(2, 3, '2026-01-15', 'Activa'),
(2, 5, '2026-01-15', 'Activa'),
(3, 2, '2026-01-16', 'Activa'),
(3, 4, '2026-01-16', 'Activa'),
(3, 6, '2026-01-16', 'Activa'),
(4, 1, '2026-01-16', 'Activa'),
(4, 7, '2026-01-16', 'Activa'),
(4, 8, '2026-01-16', 'Activa'),
(5, 3, '2026-01-17', 'Activa'),
(5, 5, '2026-01-17', 'Activa'),
(5, 9, '2026-01-17', 'Activa'),
(6, 1, '2026-01-17', 'Activa'),
(6, 10, '2026-01-17', 'Activa'),
(6, 11, '2026-01-17', 'Activa'),
(7, 2, '2026-01-18', 'Activa'),
(7, 6, '2026-01-18', 'Activa'),
(7, 12, '2026-01-18', 'Activa'),
(8, 1, '2026-01-18', 'Activa'),
(8, 4, '2026-01-18', 'Activa'),
(9, 3, '2026-01-19', 'Activa'),
(9, 7, '2026-01-19', 'Activa'),
(10, 5, '2026-01-19', 'Activa'),
(10, 8, '2026-01-19', 'Activa'),
(11, 1, '2026-01-19', 'Activa'),
(11, 9, '2026-01-19', 'Activa'),
(12, 2, '2026-01-20', 'Activa');

-- ---- CALIFICACIONES (35 registros) ----
INSERT INTO calificaciones (id_inscripcion, calificacion, periodo_eval, fecha_registro, observaciones) VALUES
-- Alumno 1: inscripciones 1, 2, 3
(1, 92.50, 'Parcial 1', '2026-02-15', 'Excelente desempeño'),
(1, 88.00, 'Parcial 2', '2026-03-15', 'Buen trabajo'),
(1, 94.00, 'Parcial 3', '2026-04-15', 'Excelente desempeño continuado'),
(2, 78.00, 'Parcial 1', '2026-02-15', 'Puede mejorar'),
(2, 85.50, 'Parcial 2', '2026-03-15', 'Mejora notable'),
(2, 86.00, 'Parcial 3', '2026-04-15', 'Mejora continua'),
(3, 90.00, 'Parcial 1', '2026-02-15', 'Muy bien'),
(3, 91.50, 'Parcial 2', '2026-03-15', 'Buen trabajo'),
(3, 92.00, 'Parcial 3', '2026-04-15', 'Muy bien'),
-- Alumno 2: inscripciones 4, 5, 6
(4, 65.00, 'Parcial 1', '2026-02-15', 'Necesita refuerzo'),
(4, 70.00, 'Parcial 2', '2026-03-15', 'Mejoró ligeramente'),
(4, 78.00, 'Parcial 3', '2026-04-15', 'Aprobado'),
(5, 55.00, 'Parcial 1', '2026-02-15', 'Bajo rendimiento'),
(5, 60.00, 'Parcial 2', '2026-03-15', 'Sigue bajo'),
(5, 68.00, 'Parcial 3', '2026-04-15', 'Mejoró'),
(6, 72.00, 'Parcial 1', '2026-02-15', 'Aceptable'),
(6, 78.50, 'Parcial 2', '2026-03-15', 'Buen progreso'),
(6, 81.00, 'Parcial 3', '2026-04-15', 'Buen trabajo'),
-- Alumno 3: inscripciones 7, 8, 9
(7, 45.00, 'Parcial 1', '2026-02-15', 'Reprobado'),
(7, 50.00, 'Parcial 2', '2026-03-15', 'Mejoró pero insuficiente'),
(7, 65.00, 'Parcial 3', '2026-04-15', 'Aprobado apenas'),
(8, 88.00, 'Parcial 1', '2026-02-15', 'Buen desempeño'),
(8, 91.00, 'Parcial 2', '2026-03-15', 'Excelente'),
(8, 95.00, 'Parcial 3', '2026-04-15', 'Excelente'),
(9, 30.00, 'Parcial 1', '2026-02-15', 'Muy bajo'),
(9, 42.00, 'Parcial 2', '2026-03-15', 'Ligeramente mejorado'),
(9, 55.00, 'Parcial 3', '2026-04-15', 'Bajo pero mejoró'),
-- Alumno 4: inscripciones 10, 11, 12
(10, 98.00, 'Parcial 1', '2026-02-15', 'Excelente'),
(10, 100.00, 'Parcial 2', '2026-03-15', 'Perfecto'),
(10, 99.00, 'Parcial 3', '2026-04-15', 'Sobresaliente'),
(11, 75.00, 'Parcial 1', '2026-02-15', 'Aceptable'),
(11, 79.50, 'Parcial 2', '2026-03-15', 'Buen avance'),
(11, 83.00, 'Parcial 3', '2026-04-15', 'Buen avance'),
(12, 82.00, 'Parcial 1', '2026-02-15', 'Bien'),
(12, 85.00, 'Parcial 2', '2026-03-15', 'Buen desempeño'),
(12, 88.00, 'Parcial 3', '2026-04-15', 'Muy bien'),
-- Alumno 5: inscripciones 13, 14, 15
(13, 40.00, 'Parcial 1', '2026-02-15', 'Reprobado'),
(13, 50.00, 'Parcial 2', '2026-03-15', 'Mejoró ligeramente'),
(13, 70.00, 'Parcial 3', '2026-04-15', 'Aprobado'),
(14, 58.00, 'Parcial 1', '2026-02-15', 'Bajo'),
(14, 65.00, 'Parcial 2', '2026-03-15', 'Mejoró'),
(14, 75.00, 'Parcial 3', '2026-04-15', 'Buen trabajo'),
(15, 62.00, 'Parcial 1', '2026-02-15', 'Regular'),
(15, 70.00, 'Parcial 2', '2026-03-15', 'Progreso'),
(15, 79.00, 'Parcial 3', '2026-04-15', 'Aceptable'),
-- Alumno 6: inscripciones 16, 17, 18
(16, 91.00, 'Parcial 1', '2026-02-15', 'Muy bien'),
(16, 92.00, 'Parcial 2', '2026-03-15', 'Excelente trabajo'),
(16, 93.00, 'Parcial 3', '2026-04-15', 'Muy bien'),
(17, 85.00, 'Parcial 1', '2026-02-15', 'Buen trabajo'),
(17, 86.50, 'Parcial 2', '2026-03-15', 'Buen desempeño'),
(17, 87.00, 'Parcial 3', '2026-04-15', 'Buen desempeño'),
(18, 78.00, 'Parcial 1', '2026-02-15', 'Aceptable'),
(18, 81.00, 'Parcial 2', '2026-03-15', 'Buen progreso'),
(18, 84.00, 'Parcial 3', '2026-04-15', 'Aceptable'),
-- Alumno 7: inscripciones 19, 20, 21
(19, 69.00, 'Parcial 1', '2026-02-15', 'Necesita mejorar'),
(19, 73.00, 'Parcial 2', '2026-03-15', 'Mejora'),
(19, 76.00, 'Parcial 3', '2026-04-15', 'Mejoró'),
(20, 55.00, 'Parcial 1', '2026-02-15', 'Bajo rendimiento'),
(20, 60.50, 'Parcial 2', '2026-03-15', 'Ligera mejora'),
(20, 68.00, 'Parcial 3', '2026-04-15', 'Bajo pero aprobado'),
(21, 73.00, 'Parcial 1', '2026-02-15', 'Regular'),
(21, 76.50, 'Parcial 2', '2026-03-15', 'Progreso'),
(21, 80.00, 'Parcial 3', '2026-04-15', 'Buen trabajo'),
-- Alumno 8: inscripciones 22, 23, 24
(22, 96.00, 'Parcial 1', '2026-02-15', 'Excelente'),
(22, 97.50, 'Parcial 2', '2026-03-15', 'Sobresaliente'),
(22, 98.00, 'Parcial 3', '2026-04-15', 'Excelente'),
(23, 81.00, 'Parcial 1', '2026-02-15', 'Buen desempeño'),
(23, 83.50, 'Parcial 2', '2026-03-15', 'Buen avance'),
(23, 86.00, 'Parcial 3', '2026-04-15', 'Buen desempeño'),
(24, 44.00, 'Parcial 1', '2026-02-15', 'Reprobado'),
(24, 52.00, 'Parcial 2', '2026-03-15', 'Ligera mejora'),
(24, 62.00, 'Parcial 3', '2026-04-15', 'Aprobado'),
-- Alumno 9: inscripciones 25, 26, 27
(25, 77.00, 'Parcial 1', '2026-02-15', 'Aceptable'),
(25, 80.50, 'Parcial 2', '2026-03-15', 'Buen trabajo'),
(25, 85.00, 'Parcial 3', '2026-04-15', 'Buen trabajo'),
(26, 63.00, 'Parcial 1', '2026-02-15', 'Regular'),
(26, 68.50, 'Parcial 2', '2026-03-15', 'Mejora'),
(26, 74.00, 'Parcial 3', '2026-04-15', 'Aceptable'),
(27, 89.00, 'Parcial 1', '2026-02-15', 'Muy bien'),
(27, 92.50, 'Parcial 2', '2026-03-15', 'Excelente'),
(27, 96.00, 'Parcial 3', '2026-04-15', 'Excelente'),
-- Alumno 10: inscripciones 28, 29, 30
(28, 71.00, 'Parcial 1', '2026-02-15', 'Aceptable'),
(28, 75.50, 'Parcial 2', '2026-03-15', 'Progreso'),
(28, 82.00, 'Parcial 3', '2026-04-15', 'Buen desempeño');

-- ---- PERIODOS_DOCENTE (Períodos activados por docente) ----
INSERT INTO periodos_docente (id_docente, periodo, activo) VALUES
-- Dr. Ricardo Vega (id_docente 1)
(1, 'Parcial 1', TRUE),
(1, 'Parcial 2', TRUE),
(1, 'Parcial 3', TRUE),
-- Dra. Patricia Luna (id_docente 2)
(2, 'Parcial 1', TRUE),
(2, 'Parcial 2', TRUE),
(2, 'Parcial 3', TRUE),
-- Dr. Enrique Soto (id_docente 3)
(3, 'Parcial 1', TRUE),
(3, 'Parcial 2', FALSE),
(3, 'Parcial 3', TRUE),
-- Mtra. Laura Navarro (id_docente 4)
(4, 'Parcial 1', TRUE),
(4, 'Parcial 2', TRUE),
(4, 'Parcial 3', TRUE),
-- Dr. Francisco Campos (id_docente 5)
(5, 'Parcial 1', TRUE),
(5, 'Parcial 2', FALSE),
(5, 'Parcial 3', FALSE),
-- Dra. Carmen Delgado (id_docente 6)
(6, 'Parcial 1', TRUE),
(6, 'Parcial 2', TRUE),
(6, 'Parcial 3', TRUE),
-- Mtro. Jorge Ríos (id_docente 7)
(7, 'Parcial 1', TRUE),
(7, 'Parcial 2', TRUE),
(7, 'Parcial 3', TRUE),
-- Dra. Elena Guerrero (id_docente 8)
(8, 'Parcial 1', TRUE),
(8, 'Parcial 2', FALSE),
(8, 'Parcial 3', TRUE),
-- Dr. Manuel Ibarra (id_docente 9)
(9, 'Parcial 1', TRUE),
(9, 'Parcial 2', TRUE),
(9, 'Parcial 3', TRUE),
-- Mtra. Rosa Espinoza (id_docente 10)
(10, 'Parcial 1', TRUE),
(10, 'Parcial 2', TRUE),
(10, 'Parcial 3', TRUE);

-- ============================
-- 5. VISTAS
-- ============================

-- Vista 1: vista_historial
-- Muestra alumno, materia y calificación (historial académico)
CREATE OR REPLACE VIEW vista_historial AS
SELECT
    a.id_alumno,
    a.nombre || ' ' || a.apellido AS alumno,
    m.nombre AS materia,
    m.clave,
    c.calificacion,
    c.periodo_eval,
    g.periodo,
    c.fecha_registro
FROM alumnos a
JOIN inscripciones i ON a.id_alumno = i.id_alumno
JOIN grupos g ON i.id_grupo = g.id_grupo
JOIN materias m ON g.id_materia = m.id_materia
LEFT JOIN calificaciones c ON i.id_inscripcion = c.id_inscripcion;

-- Vista 2: vista_promedios
-- Muestra el promedio por alumno
CREATE OR REPLACE VIEW vista_promedios AS
SELECT
    a.id_alumno,
    a.nombre || ' ' || a.apellido AS alumno,
    ROUND(AVG(c.calificacion), 2) AS promedio,
    COUNT(c.id_calificacion) AS total_calificaciones
FROM alumnos a
JOIN inscripciones i ON a.id_alumno = i.id_alumno
JOIN calificaciones c ON i.id_inscripcion = c.id_inscripcion
GROUP BY a.id_alumno, a.nombre, a.apellido;

-- ============================
-- 6. FUNCIONES
-- ============================

-- Función 1: fn_promedio_alumno(id_alumno)
-- Devuelve el promedio de calificaciones de un alumno
-- Justificación: Centraliza el cálculo del promedio para reutilizar en consultas y vistas
CREATE OR REPLACE FUNCTION fn_promedio_alumno(p_id_alumno INT)
RETURNS NUMERIC AS $$
DECLARE
    v_promedio NUMERIC;
BEGIN
    SELECT ROUND(AVG(c.calificacion), 2)
    INTO v_promedio
    FROM calificaciones c
    JOIN inscripciones i ON c.id_inscripcion = i.id_inscripcion
    WHERE i.id_alumno = p_id_alumno;

    RETURN COALESCE(v_promedio, 0);
END;
$$ LANGUAGE plpgsql;

-- Función 2: fn_estatus_alumno(id_alumno)
-- Devuelve 'Aprobado' o 'Reprobado' usando CASE
-- Justificación: Determinación automática del estatus; se usa en vistas y consultas
CREATE OR REPLACE FUNCTION fn_estatus_alumno(p_id_alumno INT)
RETURNS VARCHAR AS $$
DECLARE
    v_promedio NUMERIC;
    v_estatus VARCHAR;
BEGIN
    v_promedio := fn_promedio_alumno(p_id_alumno);

    v_estatus := CASE
        WHEN v_promedio >= 70 THEN 'Aprobado'
        ELSE 'Reprobado'
    END;

    RETURN v_estatus;
END;
$$ LANGUAGE plpgsql;

-- ============================
-- 7. PROCEDIMIENTOS ALMACENADOS
-- ============================

-- Procedimiento 1: sp_registrar_calificacion
-- Registra una nueva calificación para una inscripción
-- Justificación: Encapsula la lógica de registro con validación
CREATE OR REPLACE PROCEDURE sp_registrar_calificacion(
    p_id_inscripcion INT,
    p_calificacion NUMERIC,
    p_periodo_eval VARCHAR
)
LANGUAGE plpgsql AS $$
BEGIN
    -- Validar que la inscripción existe
    IF NOT EXISTS (SELECT 1 FROM inscripciones WHERE id_inscripcion = p_id_inscripcion) THEN
        RAISE EXCEPTION 'La inscripción con ID % no existe', p_id_inscripcion;
    END IF;

    -- Validar rango de calificación
    IF p_calificacion < 0 OR p_calificacion > 100 THEN
        RAISE EXCEPTION 'La calificación debe estar entre 0 y 100. Valor recibido: %', p_calificacion;
    END IF;

    INSERT INTO calificaciones (id_inscripcion, calificacion, periodo_eval, fecha_registro)
    VALUES (p_id_inscripcion, p_calificacion, p_periodo_eval, CURRENT_DATE);

    RAISE NOTICE 'Calificación registrada exitosamente para inscripción %', p_id_inscripcion;
END;
$$;

-- Procedimiento 2: sp_consultar_desempeno(id_alumno)
-- Muestra el desempeño completo de un alumno
-- Justificación: Consulta consolidada que combina historial, promedio y estatus
CREATE OR REPLACE PROCEDURE sp_consultar_desempeno(
    p_id_alumno INT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_nombre VARCHAR;
    v_promedio NUMERIC;
    v_estatus VARCHAR;
    r RECORD;
BEGIN
    -- Obtener nombre del alumno
    SELECT nombre || ' ' || apellido INTO v_nombre
    FROM alumnos WHERE id_alumno = p_id_alumno;

    IF v_nombre IS NULL THEN
        RAISE EXCEPTION 'El alumno con ID % no existe', p_id_alumno;
    END IF;

    -- Calcular promedio y estatus
    v_promedio := fn_promedio_alumno(p_id_alumno);
    v_estatus := fn_estatus_alumno(p_id_alumno);

    RAISE NOTICE '========================================';
    RAISE NOTICE 'DESEMPEÑO DEL ALUMNO: %', v_nombre;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Promedio General: %', v_promedio;
    RAISE NOTICE 'Estatus: %', v_estatus;
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'DETALLE DE CALIFICACIONES:';

    FOR r IN
        SELECT m.nombre AS materia, c.calificacion, c.periodo_eval
        FROM calificaciones c
        JOIN inscripciones i ON c.id_inscripcion = i.id_inscripcion
        JOIN grupos g ON i.id_grupo = g.id_grupo
        JOIN materias m ON g.id_materia = m.id_materia
        WHERE i.id_alumno = p_id_alumno
        ORDER BY m.nombre, c.periodo_eval
    LOOP
        RAISE NOTICE '  % | % | %', r.materia, r.calificacion, r.periodo_eval;
    END LOOP;

    RAISE NOTICE '========================================';
END;
$$;

-- ============================
-- 8. TRIGGER
-- ============================

-- Trigger: Validar que la calificación esté entre 0 y 100
-- Justificación: Doble validación (además del CHECK) a nivel de trigger para
-- garantizar integridad ante INSERTs y UPDATEs, y generar mensajes descriptivos
CREATE OR REPLACE FUNCTION fn_trg_validar_calificacion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.calificacion IS NOT NULL AND (NEW.calificacion < 0 OR NEW.calificacion > 100) THEN
        RAISE EXCEPTION 'Error en trigger: La calificación % no es válida. Debe estar entre 0 y 100.',
            NEW.calificacion;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_calificacion
    BEFORE INSERT OR UPDATE ON calificaciones
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_validar_calificacion();

-- ============================
-- 9. TRANSACCIÓN: Proceso de inscripción
-- ============================

-- Procedimiento con transacción: sp_inscribir_alumno
-- Realiza la inscripción y crea registros de calificaciones iniciales
-- Si algo falla, hace ROLLBACK completo
-- Justificación: Garantiza atomicidad en el proceso de inscripción
CREATE OR REPLACE PROCEDURE sp_inscribir_alumno(
    p_id_alumno INT,
    p_id_grupo INT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_id_inscripcion INT;
BEGIN
    -- Validar que el alumno existe
    IF NOT EXISTS (SELECT 1 FROM alumnos WHERE id_alumno = p_id_alumno) THEN
        RAISE EXCEPTION 'El alumno con ID % no existe', p_id_alumno;
    END IF;

    -- Validar que el grupo existe
    IF NOT EXISTS (SELECT 1 FROM grupos WHERE id_grupo = p_id_grupo) THEN
        RAISE EXCEPTION 'El grupo con ID % no existe', p_id_grupo;
    END IF;

    -- Validar que no esté ya inscrito
    IF EXISTS (SELECT 1 FROM inscripciones WHERE id_alumno = p_id_alumno AND id_grupo = p_id_grupo) THEN
        RAISE EXCEPTION 'El alumno % ya está inscrito en el grupo %', p_id_alumno, p_id_grupo;
    END IF;

    -- INSERT en inscripciones
    INSERT INTO inscripciones (id_alumno, id_grupo, fecha, estado)
    VALUES (p_id_alumno, p_id_grupo, CURRENT_DATE, 'Activa')
    RETURNING id_inscripcion INTO v_id_inscripcion;

    -- INSERT en calificaciones (registro inicial sin calificación)
    INSERT INTO calificaciones (id_inscripcion, calificacion, periodo_eval, fecha_registro, observaciones)
    VALUES (v_id_inscripcion, NULL, 'Parcial 1', NULL, 'Pendiente de evaluación');

    RAISE NOTICE 'Inscripción exitosa. ID inscripción: %, Alumno: %, Grupo: %',
        v_id_inscripcion, p_id_alumno, p_id_grupo;

    -- Si llegamos aquí, se hace COMMIT implícito
    -- Si ocurre algún error, PostgreSQL hace ROLLBACK automático
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error en inscripción: %. Se realizó ROLLBACK.', SQLERRM;
END;
$$;

-- ============================
-- 10. CONSULTAS OBLIGATORIAS
-- ============================

-- CONSULTA 1: Historial académico de un alumno
-- Usa JOIN entre alumnos, inscripciones, grupos, materias y calificaciones
-- Ejemplo: historial del alumno con id_alumno = 1
/*
SELECT
    a.nombre || ' ' || a.apellido AS alumno,
    m.nombre AS materia,
    m.clave,
    g.periodo,
    c.calificacion,
    c.periodo_eval,
    fn_estatus_alumno(a.id_alumno) AS estatus
FROM alumnos a
JOIN inscripciones i ON a.id_alumno = i.id_alumno
JOIN grupos g ON i.id_grupo = g.id_grupo
JOIN materias m ON g.id_materia = m.id_materia
LEFT JOIN calificaciones c ON i.id_inscripcion = c.id_inscripcion
WHERE a.id_alumno = 1
ORDER BY m.nombre, c.periodo_eval;
*/

-- CONSULTA 2: Promedio por alumno
-- Usa AVG + GROUP BY
/*
SELECT
    a.id_alumno,
    a.nombre || ' ' || a.apellido AS alumno,
    ROUND(AVG(c.calificacion), 2) AS promedio,
    fn_estatus_alumno(a.id_alumno) AS estatus
FROM alumnos a
JOIN inscripciones i ON a.id_alumno = i.id_alumno
JOIN calificaciones c ON i.id_inscripcion = c.id_inscripcion
GROUP BY a.id_alumno, a.nombre, a.apellido
ORDER BY promedio DESC;
*/

-- CONSULTA 3: Alumnos con promedio mayor al promedio general
-- Usa subconsulta en WHERE
/*
SELECT
    a.id_alumno,
    a.nombre || ' ' || a.apellido AS alumno,
    fn_promedio_alumno(a.id_alumno) AS promedio
FROM alumnos a
WHERE fn_promedio_alumno(a.id_alumno) > (
    SELECT AVG(calificacion) FROM calificaciones
)
AND EXISTS (
    SELECT 1 FROM inscripciones i
    JOIN calificaciones c ON i.id_inscripcion = c.id_inscripcion
    WHERE i.id_alumno = a.id_alumno
)
ORDER BY promedio DESC;
*/

-- CONSULTA 4: Alumnos reprobados (promedio < 70)
/*
SELECT
    a.id_alumno,
    a.nombre || ' ' || a.apellido AS alumno,
    fn_promedio_alumno(a.id_alumno) AS promedio,
    fn_estatus_alumno(a.id_alumno) AS estatus
FROM alumnos a
WHERE fn_promedio_alumno(a.id_alumno) < 70
AND EXISTS (
    SELECT 1 FROM inscripciones i
    JOIN calificaciones c ON i.id_inscripcion = c.id_inscripcion
    WHERE i.id_alumno = a.id_alumno
)
ORDER BY promedio ASC;
*/

-- CONSULTA PLUS: Función dentro de HAVING
-- Materias con promedio > 80 agrupadas por materia, usando fn_promedio_alumno en HAVING
/*
SELECT
    m.nombre AS materia,
    ROUND(AVG(c.calificacion), 2) AS promedio_materia,
    COUNT(DISTINCT i.id_alumno) AS total_alumnos
FROM materias m
JOIN grupos g ON m.id_materia = g.id_materia
JOIN inscripciones i ON g.id_grupo = i.id_grupo
JOIN calificaciones c ON i.id_inscripcion = c.id_inscripcion
GROUP BY m.id_materia, m.nombre
HAVING AVG(c.calificacion) > (
    SELECT AVG(calificacion) FROM calificaciones
)
ORDER BY promedio_materia DESC;
*/

-- ============================
-- 11. ROLES Y PERMISOS
-- ============================

-- Crear roles (si no existen)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_admin') THEN
        CREATE ROLE rol_admin WITH LOGIN PASSWORD 'admin123';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_docente') THEN
        CREATE ROLE rol_docente WITH LOGIN PASSWORD 'docente123';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_alumno') THEN
        CREATE ROLE rol_alumno WITH LOGIN PASSWORD 'alumno123';
    END IF;
END
$$;

-- Permisos para rol_admin: todos los permisos
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rol_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rol_admin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO rol_admin;
GRANT EXECUTE ON ALL PROCEDURES IN SCHEMA public TO rol_admin;

-- Permisos para rol_docente: SELECT en alumnos, INSERT/UPDATE en calificaciones
GRANT SELECT ON alumnos TO rol_docente;
GRANT SELECT ON inscripciones TO rol_docente;
GRANT SELECT ON grupos TO rol_docente;
GRANT SELECT ON materias TO rol_docente;
GRANT SELECT, INSERT, UPDATE ON calificaciones TO rol_docente;
GRANT USAGE ON SEQUENCE calificaciones_id_calificacion_seq TO rol_docente;
GRANT SELECT ON vista_historial TO rol_docente;
GRANT SELECT ON vista_promedios TO rol_docente;
GRANT EXECUTE ON FUNCTION fn_promedio_alumno(INT) TO rol_docente;
GRANT EXECUTE ON FUNCTION fn_estatus_alumno(INT) TO rol_docente;

-- Permisos para rol_alumno: SELECT solo su información
GRANT SELECT ON alumnos TO rol_alumno;
GRANT SELECT ON inscripciones TO rol_alumno;
GRANT SELECT ON calificaciones TO rol_alumno;
GRANT SELECT ON grupos TO rol_alumno;
GRANT SELECT ON materias TO rol_alumno;
GRANT SELECT ON vista_historial TO rol_alumno;
GRANT SELECT ON vista_promedios TO rol_alumno;
GRANT EXECUTE ON FUNCTION fn_promedio_alumno(INT) TO rol_alumno;
GRANT EXECUTE ON FUNCTION fn_estatus_alumno(INT) TO rol_alumno;

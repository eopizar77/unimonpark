-- ============================================================================
-- SCRIPT DE CARGA DE DATOS: carga_datos.sql
-- Base de Datos: mi_base_datos | Esquema: unimonpark
-- Fecha: 2026-09-22
-- Descripción:
--   Inserción individual y segura para evitar errores de sintaxis o división
--   de comandos en DBeaver / pgAdmin.
--   Sin credenciales (nombre_usuario ni contrasena_hash) para roles de cliente.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. VISITANTE EXTERNO
-- ----------------------------------------------------------------------------
INSERT INTO unimonpark.externos (tipo_documento, numero_documento, nombres, apellidos, telefono, correo, empresa, activo, fecha_creacion)
VALUES ('CC', '12195866', 'LUIS', 'BERNAL', '3100000001', 'luis.bernal@externos.com', 'Visitante Independiente', TRUE, NOW())
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. USUARIOS INSTITUCIONALES (Docentes, Administrativos, Estudiantes)
-- ----------------------------------------------------------------------------

-- A) Docentes y Administrativos (Bicicletas)
INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('79735940', 'BENAVIDES VELASQUEZ', 'OSCAR OSWALDO', 'oscar.benavides79735940@unimonserrate.edu.co', '3107973594', 'cliente_79735940', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%DOCENTE%' OR UPPER(nombre) LIKE '%DAE%' OR id_rol = 8 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('79575682', 'PIZA', 'ELVER', 'elver.piza79575682@unimonserrate.edu.co', '3107957568', 'cliente_79575682', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%DOCENTE%' OR UPPER(nombre) LIKE '%DAE%' OR id_rol = 8 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('80412388', 'LINARES RODRIGUEZ', 'VICTOR ANDRES', 'victor.linares80412388@unimonserrate.edu.co', '3108041238', 'cliente_80412388', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%DOCENTE%' OR UPPER(nombre) LIKE '%DAE%' OR id_rol = 8 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('79400382', 'MALDONADO TORRES', 'OSCAR LIBARDO', 'oscar.maldonado79400382@unimonserrate.edu.co', '3107940038', 'cliente_79400382', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%DOCENTE%' OR UPPER(nombre) LIKE '%DAE%' OR id_rol = 8 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

-- B) Estudiantes (Bicicletas)
INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1031640283', 'LARA', 'CAMILO', 'camilo.lara1031640283@unimonserrate.edu.co', '3110316402', 'cliente_1031640283', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%ESTUDIANTE%' OR id_rol = 7 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1141317540', 'JIMENEZ', 'SARA', 'sara.jimenez1141317540@unimonserrate.edu.co', '3111413175', 'cliente_1141317540', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%ESTUDIANTE%' OR id_rol = 7 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1019989502', 'CARBAL PINILLA', 'JEAN PIERRE', 'jean.carbal1019989502@unimonserrate.edu.co', '3110199895', 'cliente_1019989502', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%ESTUDIANTE%' OR id_rol = 7 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1145224818', 'CARO TABARES', 'JULIAN FERNANDO', 'julian.caro1145224818@unimonserrate.edu.co', '3111452248', 'cliente_1145224818', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%ESTUDIANTE%' OR id_rol = 7 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1023381076', 'MARENTEZ', 'ISABELLA', 'isabella.marentez1023381076@unimonserrate.edu.co', '3110233810', 'cliente_1023381076', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%ESTUDIANTE%' OR id_rol = 7 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1257747', 'MOLLEDA CRESPO', 'LIRIANGEL', 'liriangel.molleda1257747@unimonserrate.edu.co', '3101257747', 'cliente_1257747', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%ESTUDIANTE%' OR id_rol = 7 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1029281222', 'PINEDA', 'JUAN DAVID', 'juan.pineda1029281222@unimonserrate.edu.co', '3110292812', 'cliente_1029281222', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%ESTUDIANTE%' OR id_rol = 7 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1001116317', 'RAMIREZ NIVIAYO', 'BRAYAN ESTIVEN', 'brayan.ramirez1001116317@unimonserrate.edu.co', '3110011163', 'cliente_1001116317', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%ESTUDIANTE%' OR id_rol = 7 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1023949916', 'USAQUEN CABALLERO', 'ALEJANDRA DEL', 'alejandra.usaquen1023949916@unimonserrate.edu.co', '3110239499', 'cliente_1023949916', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%ESTUDIANTE%' OR id_rol = 7 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

-- C) Docentes y Administrativos (Carros)
INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('19332350', 'CALDERÓN GUZMÁN', 'JORGE ELIECER', 'jorge.calderon19332350@unimonserrate.edu.co', '3101933235', 'cliente_19332350', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%DOCENTE%' OR UPPER(nombre) LIKE '%DAE%' OR id_rol = 8 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('80878863', 'CUCAITA DIAZ', 'MIGUEL JOSE', 'miguel.cucaita80878863@unimonserrate.edu.co', '3108087886', 'cliente_80878863', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%DOCENTE%' OR UPPER(nombre) LIKE '%DAE%' OR id_rol = 8 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('11314375', 'MOSQUERA', 'WILLIAM EDUARDO', 'william.mosquera11314375@unimonserrate.edu.co', '3101131437', 'cliente_11314375', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%DOCENTE%' OR UPPER(nombre) LIKE '%DAE%' OR id_rol = 8 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('79657135', 'ROJAS AMADOR', 'SOCRATES', 'socrates.rojas79657135@unimonserrate.edu.co', '3107965713', 'cliente_79657135', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%DOCENTE%' OR UPPER(nombre) LIKE '%DAE%' OR id_rol = 8 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

-- D) Estudiantes (Carros)
INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1012353440', 'ROJAS SANCHEZ', 'NIKOL TATIANA', 'nikol.rojas1012353440@unimonserrate.edu.co', '3110123534', 'cliente_1012353440', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%ESTUDIANTE%' OR id_rol = 7 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

-- E) Estudiantes (Motos)
INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1012333904', 'ANDRES GALARZA', 'JHOAN ANDRES', 'jhoan.galarza1012333904@unimonserrate.edu.co', '3110123339', 'cliente_1012333904', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%ESTUDIANTE%' OR id_rol = 7 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1000706853', 'AREVALO RINCON', 'JULIAN', 'julian.arevalo1000706853@unimonserrate.edu.co', '3110007068', 'cliente_1000706853', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%ESTUDIANTE%' OR id_rol = 7 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

-- F) Docentes y Administrativos (Carros)
INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('11231119', 'EDGAR RINCON', 'MARIO EDGAR', 'mario.rincon11231119@unimonserrate.edu.co', '3101123111', 'cliente_11231119', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%DOCENTE%' OR UPPER(nombre) LIKE '%DAE%' OR id_rol = 8 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('52778241', 'MILA RIOS', 'CLAUDIA MARCELA', 'claudia.mila52778241@unimonserrate.edu.co', '3105277824', 'cliente_52778241', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%DOCENTE%' OR UPPER(nombre) LIKE '%DAE%' OR id_rol = 8 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1010960675', 'GONZALEZ LOPEZ', 'ISABELLA', 'isabella.gonzalez1010960675@unimonserrate.edu.co', '3110109606', 'cliente_1010960675', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%DOCENTE%' OR UPPER(nombre) LIKE '%DAE%' OR id_rol = 8 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('52097718', 'PEREZ BERNATE', 'YENNY ROCIO', 'yenny.perez52097718@unimonserrate.edu.co', '3105209771', 'cliente_52097718', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%DOCENTE%' OR UPPER(nombre) LIKE '%DAE%' OR id_rol = 8 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

-- G) Docentes y Administrativos (Motos)
INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1006068306', 'LASSO', 'FELIPE', 'felipe.lasso1006068306@unimonserrate.edu.co', '3110060683', 'cliente_1006068306', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%DOCENTE%' OR UPPER(nombre) LIKE '%DAE%' OR id_rol = 8 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1030523558', 'JAVIER SANCHEZ', 'JOHN JAVIER', 'john.sanchez1030523558@unimonserrate.edu.co', '3110305235', 'cliente_1030523558', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%DOCENTE%' OR UPPER(nombre) LIKE '%DAE%' OR id_rol = 8 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('79619465', 'GALVIS JIMENEZ', 'JORGE URIEL', 'jorge.galvis79619465@unimonserrate.edu.co', '3107961946', 'cliente_79619465', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%DOCENTE%' OR UPPER(nombre) LIKE '%DAE%' OR id_rol = 8 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1022431563', 'PINZON MUÑOZ', 'MIGUEL ANGEL', 'miguel.pinzon1022431563@unimonserrate.edu.co', '3110224315', 'cliente_1022431563', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%DOCENTE%' OR UPPER(nombre) LIKE '%DAE%' OR id_rol = 8 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1032472546', 'RIOS MONTAÑEZ', 'SAMIR FRANCISCO', 'samir.rios1032472546@unimonserrate.edu.co', '3110324725', 'cliente_1032472546', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%DOCENTE%' OR UPPER(nombre) LIKE '%DAE%' OR id_rol = 8 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('80156109', 'VELANDIA BERMUDEZ', 'HARRY ALEXANDER', 'harry.velandia80156109@unimonserrate.edu.co', '3108015610', 'cliente_80156109', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%DOCENTE%' OR UPPER(nombre) LIKE '%DAE%' OR id_rol = 8 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1022993216', 'CAMPIÑO SANTOS', 'LIZETH JULISA', 'lizeth.campino1022993216@unimonserrate.edu.co', '3110229932', 'cliente_1022993216', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%DOCENTE%' OR UPPER(nombre) LIKE '%DAE%' OR id_rol = 8 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1014304848', 'GUTIÉRREZ CRISTANCHO', 'MARÍA ALEJANDRA', 'maria.gutierrez1014304848@unimonserrate.edu.co', '3110143048', 'cliente_1014304848', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%DOCENTE%' OR UPPER(nombre) LIKE '%DAE%' OR id_rol = 8 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1007296585', 'HERNANDEZ GALEANO', 'JEFERSON CAMILO', 'jeferson.hernandez1007296585@unimonserrate.edu.co', '3110072965', 'cliente_1007296585', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%DOCENTE%' OR UPPER(nombre) LIKE '%DAE%' OR id_rol = 8 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1015476215', 'RUBIANO RODRIGUEZ', 'LEONARDO ANDRES', 'leonardo.rubiano1015476215@unimonserrate.edu.co', '3110154762', 'cliente_1015476215', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%DOCENTE%' OR UPPER(nombre) LIKE '%DAE%' OR id_rol = 8 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

-- H) Estudiantes (Motos)
INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1013124729', 'THOMAS BALLESTEROS', 'ANGEL THOMAS', 'angel.thomas1013124729@unimonserrate.edu.co', '3110131247', 'cliente_1013124729', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%ESTUDIANTE%' OR id_rol = 7 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1028484980', 'ALEJANDRO MORENO', 'JOSE ALEJANDRO', 'jose.moreno1028484980@unimonserrate.edu.co', '3110284849', 'cliente_1028484980', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%ESTUDIANTE%' OR id_rol = 7 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1016833366', 'PABLO GUTIERREZ', 'JUAN PABLO', 'juan.gutierrez1016833366@unimonserrate.edu.co', '3110168333', 'cliente_1016833366', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%ESTUDIANTE%' OR id_rol = 7 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1014477565', 'XIMENA BOHORQUEZ', 'LAURA XIMENA', 'laura.bohorquez1014477565@unimonserrate.edu.co', '3110144775', 'cliente_1014477565', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%ESTUDIANTE%' OR id_rol = 7 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1001346876', 'DANIELA MUÑOZ', 'LAURA DANIELA', 'laura.munoz1001346876@unimonserrate.edu.co', '3110013468', 'cliente_1001346876', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%ESTUDIANTE%' OR id_rol = 7 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1025530698', 'YERALDY SOTO', 'LILI YERALDY', 'lili.soto1025530698@unimonserrate.edu.co', '3110255306', 'cliente_1025530698', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%ESTUDIANTE%' OR id_rol = 7 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1014669034', 'VALENCIA', 'SAMUEL', 'samuel.valencia1014669034@unimonserrate.edu.co', '3110146690', 'cliente_1014669034', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%ESTUDIANTE%' OR id_rol = 7 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1016943473', 'CARRANZA', 'STEPHANIE', 'stephanie.carranza1016943473@unimonserrate.edu.co', '3110169434', 'cliente_1016943473', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%ESTUDIANTE%' OR id_rol = 7 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

INSERT INTO unimonpark.usuarios (documento, apellidos, nombres, correo, telefono, nombre_usuario, contrasena_hash, id_rol, voluntario_centro_obrero, activo, fecha_creacion)
VALUES ('1027402197', 'FRANCO FLOREZ', 'SHARAY GISETH', 'sharay.franco1027402197@unimonserrate.edu.co', '3110274021', 'cliente_1027402197', '$2a$10$wT0X8gXpL6Zc7kXv3X8vJe0qfQo6p8Ew9p8Ew9p8Ew9p8Ew9p8Ew', (SELECT id_rol FROM unimonpark.roles WHERE UPPER(nombre) LIKE '%ESTUDIANTE%' OR id_rol = 7 LIMIT 1), FALSE, TRUE, NOW())
ON CONFLICT (documento) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. VEHÍCULOS ASOCIADOS (Bicicletas, Carros, Motos)
-- ----------------------------------------------------------------------------

-- A) Bicicletas (id_tipo_vehiculo = 3)
INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('4', 'GW', 'Alligator', 'Negro', TRUE, NOW(), 'DOCENTE_ADMINISTRATIVO', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '79735940'), NULL, 3)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('6', 'Venzo', 'Loki', 'Azul', TRUE, NOW(), 'DOCENTE_ADMINISTRATIVO', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '79575682'), NULL, 3)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('7', 'Specialized', 'Rockhopper', 'Rojo', TRUE, NOW(), 'DOCENTE_ADMINISTRATIVO', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '80412388'), NULL, 3)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('8', 'Trek', 'Marlin 5', 'Gris', TRUE, NOW(), 'DOCENTE_ADMINISTRATIVO', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '79400382'), NULL, 3)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('1', 'Scott', 'Aspect 950', 'Negro/Verde', TRUE, NOW(), 'ESTUDIANTE', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1031640283'), NULL, 3)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('3', 'GW', 'Flamma', 'Blanco', TRUE, NOW(), 'ESTUDIANTE', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1141317540'), NULL, 3)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('14', 'Giant', 'ATX', 'Naranja', TRUE, NOW(), 'ESTUDIANTE', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1019989502'), NULL, 3)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('5', 'Venzo', 'Primal', 'Gris', TRUE, NOW(), 'ESTUDIANTE', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1145224818'), NULL, 3)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('9', 'GW', 'Scorpion', 'Morado', TRUE, NOW(), 'ESTUDIANTE', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1023381076'), NULL, 3)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('10', 'Ontrail', 'Hedge', 'Negro', TRUE, NOW(), 'ESTUDIANTE', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1257747'), NULL, 3)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('11', 'Trek', 'Dual Sport', 'Azul Marino', TRUE, NOW(), 'ESTUDIANTE', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1029281222'), NULL, 3)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('12', 'Specialized', 'Pitch', 'Amarillo', TRUE, NOW(), 'ESTUDIANTE', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1001116317'), NULL, 3)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('13', 'Scott', 'Contessa', 'Fucsia', TRUE, NOW(), 'ESTUDIANTE', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1023949916'), NULL, 3)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('2', 'GW', 'Hyena', 'Negro', TRUE, NOW(), 'EXTERNO', NULL, (SELECT id_externo FROM unimonpark.externos WHERE numero_documento = '12195866'), 3)
ON CONFLICT (placa) DO NOTHING;

-- B) Carros (id_tipo_vehiculo = 1)
INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('HJW017', 'Renault', 'Duster 2020', 'Gris Cometa', TRUE, NOW(), 'DOCENTE_ADMINISTRATIVO', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '19332350'), NULL, 1)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('BKH806', 'Chevrolet', 'Onix 2019', 'Rojo', TRUE, NOW(), 'DOCENTE_ADMINISTRATIVO', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '80878863'), NULL, 1)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('FYR389', 'Kia', 'Picanto 2021', 'Plata', TRUE, NOW(), 'DOCENTE_ADMINISTRATIVO', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '11314375'), NULL, 1)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('CDP627', 'Mazda', '3 2018', 'Blanco', TRUE, NOW(), 'DOCENTE_ADMINISTRATIVO', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '79657135'), NULL, 1)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('JLZ478', 'Nissan', 'Versa 2022', 'Azul', TRUE, NOW(), 'ESTUDIANTE', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1012353440'), NULL, 1)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('RMQ068', 'Volkswagen', 'Gol 2017', 'Gris', TRUE, NOW(), 'DOCENTE_ADMINISTRATIVO', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '11231119'), NULL, 1)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('IWR120', 'Ford', 'Fiesta 2016', 'Negro', TRUE, NOW(), 'DOCENTE_ADMINISTRATIVO', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '52778241'), NULL, 1)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('NUR430', 'Hyundai', 'Grand i10 2020', 'Blanco', TRUE, NOW(), 'DOCENTE_ADMINISTRATIVO', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1010960675'), NULL, 1)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('MKT456', 'Toyota', 'Corolla 2021', 'Plata', TRUE, NOW(), 'DOCENTE_ADMINISTRATIVO', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '52097718'), NULL, 1)
ON CONFLICT (placa) DO NOTHING;

-- C) Motos (id_tipo_vehiculo = 2)
INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('GHE10F', 'Yamaha', 'FZ 2.0 2021', 'Negro', TRUE, NOW(), 'ESTUDIANTE', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1012333904'), NULL, 2)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('DLV18G', 'Bajaj', 'Pulsar NS200 2022', 'Rojo/Negro', TRUE, NOW(), 'ESTUDIANTE', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1000706853'), NULL, 2)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('TQZ90D', 'AKT', 'NKD 125 2020', 'Negro Mate', TRUE, NOW(), 'DOCENTE_ADMINISTRATIVO', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1006068306'), NULL, 2)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('NSS18D', 'Suzuki', 'Gixxer 150 2019', 'Azul', TRUE, NOW(), 'DOCENTE_ADMINISTRATIVO', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1030523558'), NULL, 2)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('CXL49F', 'Honda', 'CB190R 2021', 'Rojo', TRUE, NOW(), 'DOCENTE_ADMINISTRATIVO', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '79619465'), NULL, 2)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('OBM58G', 'KTM', 'Duke 200 2022', 'Naranja', TRUE, NOW(), 'DOCENTE_ADMINISTRATIVO', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1022431563'), NULL, 2)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('BDV05H', 'Yamaha', 'NMAX 155 2023', 'Gris', TRUE, NOW(), 'DOCENTE_ADMINISTRATIVO', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1032472546'), NULL, 2)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('VJT32G', 'Bajaj', 'Dominar 400 2021', 'Verde', TRUE, NOW(), 'DOCENTE_ADMINISTRATIVO', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '80156109'), NULL, 2)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('XWE50E', 'Auteco', 'Victory Black 2020', 'Negro', TRUE, NOW(), 'DOCENTE_ADMINISTRATIVO', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1022993216'), NULL, 2)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('KUE63H', 'Suzuki', 'GN 125 2022', 'Rojo', TRUE, NOW(), 'DOCENTE_ADMINISTRATIVO', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1014304848'), NULL, 2)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('APM98G', 'Honda', 'XR 150L 2021', 'Blanco', TRUE, NOW(), 'DOCENTE_ADMINISTRATIVO', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1007296585'), NULL, 2)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('SMX57F', 'Yamaha', 'Crypton 115 2020', 'Azul', TRUE, NOW(), 'DOCENTE_ADMINISTRATIVO', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1015476215'), NULL, 2)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('QWC03C', 'AKT', 'Dynamic Pro 125 2019', 'Blanco/Azul', TRUE, NOW(), 'ESTUDIANTE', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1013124729'), NULL, 2)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('FCW85I', 'Bajaj', 'Discover 125 2023', 'Negro', TRUE, NOW(), 'ESTUDIANTE', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1028484980'), NULL, 2)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('LEK88F', 'Yamaha', 'XTZ 125 2021', 'Azul', TRUE, NOW(), 'ESTUDIANTE', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1016833366'), NULL, 2)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('UHM70H', 'Honda', 'Navi 110 2022', 'Rojo', TRUE, NOW(), 'ESTUDIANTE', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1014477565'), NULL, 2)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('XED50D', 'Suzuki', 'Address 110 2020', 'Plata', TRUE, NOW(), 'ESTUDIANTE', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1001346876'), NULL, 2)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('JAN68D', 'Kymco', 'Agility RS 125 2018', 'Negro Mate', TRUE, NOW(), 'ESTUDIANTE', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1025530698'), NULL, 2)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('DVQ24G', 'Hero', 'Eco Deluxe 2022', 'Rojo', TRUE, NOW(), 'ESTUDIANTE', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1014669034'), NULL, 2)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('JHK48H', 'TVS', 'Apache RTR 160 2023', 'Negro/Rojo', TRUE, NOW(), 'ESTUDIANTE', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1016943473'), NULL, 2)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO unimonpark.vehiculos (placa, marca, modelo, color, activo, fecha_creacion, categoria_persona, id_usuario, id_externo, id_tipo_vehiculo)
VALUES ('XGB13G', 'Yamaha', 'R15 V3 2022', 'Azul Racing', TRUE, NOW(), 'ESTUDIANTE', (SELECT id_usuario FROM unimonpark.usuarios WHERE documento = '1027402197'), NULL, 2)
ON CONFLICT (placa) DO NOTHING;

COMMIT;

-- ----------------------------------------------------------------------------
-- VERIFICACIÓN DE TOTALES INSERTADOS
-- ----------------------------------------------------------------------------
SELECT 'Usuarios Institucionales' AS entidad, COUNT(*) AS total FROM unimonpark.usuarios
UNION ALL
SELECT 'Visitantes Externos', COUNT(*) FROM unimonpark.externos
UNION ALL
SELECT 'Vehículos Totales', COUNT(*) FROM unimonpark.vehiculos;

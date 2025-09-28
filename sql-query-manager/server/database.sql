-- Crear base de datos
CREATE DATABASE IF NOT EXISTS sql_query_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE sql_query_manager;

-- Tabla principal de consultas
CREATE TABLE consultas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  sql_codigo TEXT NOT NULL,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  favorito BOOLEAN DEFAULT FALSE,
  padre_id INT DEFAULT NULL,
  autor VARCHAR(100),
  FOREIGN KEY (padre_id) REFERENCES consultas(id)
);

-- Tabla de etiquetas
CREATE TABLE etiquetas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL
);

-- Relación muchos a muchos entre consultas y etiquetas
CREATE TABLE consulta_etiqueta (
  consulta_id INT NOT NULL,
  etiqueta_id INT NOT NULL,
  PRIMARY KEY (consulta_id, etiqueta_id),
  FOREIGN KEY (consulta_id) REFERENCES consultas(id) ON DELETE CASCADE,
  FOREIGN KEY (etiqueta_id) REFERENCES etiquetas(id) ON DELETE CASCADE
);

-- Tabla de versiones de cada consulta
CREATE TABLE versiones_consulta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  consulta_id INT NOT NULL,
  sql_codigo TEXT NOT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (consulta_id) REFERENCES consultas(id) ON DELETE CASCADE
);

-- Datos de ejemplo
INSERT INTO etiquetas (nombre) VALUES 
('SELECT'), ('JOIN'), ('UPDATE'), ('DELETE'), ('INSERT'), ('REPORT'), ('ADMIN');

INSERT INTO consultas (titulo, descripcion, sql_codigo, autor) VALUES 
('Usuarios Activos', 'Consulta para obtener todos los usuarios activos', 'SELECT * FROM users WHERE active = 1;', 'Admin'),
('Reporte Mensual', 'Reporte de ventas mensuales', 'SELECT DATE(created_at) as fecha, COUNT(*) as total FROM orders WHERE MONTH(created_at) = MONTH(NOW()) GROUP BY DATE(created_at);', 'Analyst');

INSERT INTO consulta_etiqueta (consulta_id, etiqueta_id) VALUES 
(1, 1), (1, 7),
(2, 1), (2, 6);
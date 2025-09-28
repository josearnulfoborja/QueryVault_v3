const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// =================== CONFIGURACIÓN BASE DE DATOS ===================
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'queryvaul'
};

// Variable global para la conexión
let connection;

// Función para conectar a MySQL
async function initDB() {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a MySQL exitosamente');
    console.log(`📊 Base de datos: ${dbConfig.database}`);
    console.log(`🌐 Host: ${dbConfig.host}`);
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    console.log('💡 Asegúrate de que MySQL esté corriendo y que la base de datos exista');
    process.exit(1);
  }
}

// =================== RUTAS API ===================

// 1. Obtener todas las consultas con sus etiquetas
app.get('/api/consultas', async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT 
        c.id, 
        c.titulo, 
        c.descripcion, 
        c.sql_codigo, 
        c.fecha_creacion, 
        c.favorito, 
        c.autor,
        GROUP_CONCAT(e.nombre) as etiquetas
      FROM consultas c
      LEFT JOIN consulta_etiqueta ce ON c.id = ce.consulta_id
      LEFT JOIN etiquetas e ON ce.etiqueta_id = e.id
      ${search ? 'WHERE c.titulo LIKE ? OR c.sql_codigo LIKE ?' : ''}
      GROUP BY c.id
      ORDER BY c.fecha_creacion DESC
    `;
    
    const params = search ? [`%${search}%`, `%${search}%`] : [];
    const [rows] = await connection.execute(query, params);
    
    // Convertir etiquetas de string a array
    const consultas = rows.map(row => ({
      ...row,
      etiquetas: row.etiquetas ? row.etiquetas.split(',') : [],
      favorito: Boolean(row.favorito)
    }));
    
    res.json(consultas);
  } catch (error) {
    console.error('Error obteniendo consultas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 2. Crear nueva consulta
app.post('/api/consultas', async (req, res) => {
  try {
    const { titulo, descripcion, sql_codigo, etiquetas, autor } = req.body;
    
    // Insertar consulta
    const [result] = await connection.execute(
      'INSERT INTO consultas (titulo, descripcion, sql_codigo, autor) VALUES (?, ?, ?, ?)',
      [titulo, descripcion || null, sql_codigo, autor || null]
    );
    
    const consultaId = result.insertId;
    
    // Insertar etiquetas si existen
    if (etiquetas && etiquetas.length > 0) {
      for (const etiqueta of etiquetas) {
        // Insertar etiqueta si no existe
        await connection.execute(
          'INSERT IGNORE INTO etiquetas (nombre) VALUES (?)',
          [etiqueta]
        );
        
        // Obtener ID de la etiqueta
        const [etiquetaRow] = await connection.execute(
          'SELECT id FROM etiquetas WHERE nombre = ?',
          [etiqueta]
        );
        
        // Relacionar consulta con etiqueta
        await connection.execute(
          'INSERT INTO consulta_etiqueta (consulta_id, etiqueta_id) VALUES (?, ?)',
          [consultaId, etiquetaRow[0].id]
        );
      }
    }
    
    res.status(201).json({ id: consultaId, message: 'Consulta creada exitosamente' });
  } catch (error) {
    console.error('Error creando consulta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 3. Obtener todas las etiquetas
app.get('/api/etiquetas', async (req, res) => {
  try {
    const [rows] = await connection.execute('SELECT nombre FROM etiquetas ORDER BY nombre');
    const etiquetas = rows.map(row => row.nombre);
    res.json(etiquetas);
  } catch (error) {
    console.error('Error obteniendo etiquetas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 4. Test de conexión
app.get('/api/test', async (req, res) => {
  try {
    const [rows] = await connection.execute('SELECT 1 as test');
    res.json({ status: 'OK', message: 'Conexión a base de datos exitosa', data: rows });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

// =================== INICIALIZAR SERVIDOR ===================
async function startServer() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`🔗 API disponible en: http://localhost:${PORT}/api`);
    console.log(`🧪 Test conexión: http://localhost:${PORT}/api/test`);
  });
}

startServer();
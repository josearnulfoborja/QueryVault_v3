const express = require('express');
const mysql = require('mysql2/promise');

// Configuración de prueba
const testConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'queryvaul'
};

async function probarConexion() {
  let connection;
  
  try {
    console.log('🔄 Intentando conectar a MySQL...');
    connection = await mysql.createConnection(testConfig);
    console.log('✅ Conexión exitosa!');
    
    // Probar consulta básica
    console.log('\n📊 Probando consulta básica...');
    const [testRows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Consulta de prueba exitosa:', testRows);
    
    // Verificar que existen las tablas
    console.log('\n📋 Verificando tablas...');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? 
      ORDER BY TABLE_NAME
    `, [testConfig.database]);
    
    console.log('Tablas encontradas:');
    tables.forEach(table => {
      console.log(`  ✓ ${table.TABLE_NAME}`);
    });
    
    // Contar registros en cada tabla
    console.log('\n🔢 Contando registros...');
    
    const [consultasCount] = await connection.execute('SELECT COUNT(*) as total FROM consultas');
    console.log(`  📝 Consultas: ${consultasCount[0].total} registros`);
    
    const [etiquetasCount] = await connection.execute('SELECT COUNT(*) as total FROM etiquetas');
    console.log(`  🏷️  Etiquetas: ${etiquetasCount[0].total} registros`);
    
    const [relacionesCount] = await connection.execute('SELECT COUNT(*) as total FROM consulta_etiqueta');
    console.log(`  🔗 Relaciones: ${relacionesCount[0].total} registros`);
    
    // Probar la consulta principal del API
    console.log('\n🚀 Probando consulta principal del API...');
    const [consultas] = await connection.execute(`
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
      GROUP BY c.id
      ORDER BY c.fecha_creacion DESC
      LIMIT 3
    `);
    
    console.log('✅ Primeras 3 consultas obtenidas:');
    consultas.forEach((consulta, index) => {
      console.log(`  ${index + 1}. "${consulta.titulo}" por ${consulta.autor}`);
      console.log(`     Etiquetas: ${consulta.etiquetas || 'Sin etiquetas'}`);
    });
    
    // Probar búsqueda
    console.log('\n🔍 Probando búsqueda...');
    const [busqueda] = await connection.execute(`
      SELECT 
        c.id, 
        c.titulo, 
        c.autor,
        GROUP_CONCAT(e.nombre) as etiquetas
      FROM consultas c
      LEFT JOIN consulta_etiqueta ce ON c.id = ce.consulta_id
      LEFT JOIN etiquetas e ON ce.etiqueta_id = e.id
      WHERE c.titulo LIKE ? OR c.sql_codigo LIKE ?
      GROUP BY c.id
      ORDER BY c.fecha_creacion DESC
    `, ['%usuarios%', '%usuarios%']);
    
    console.log(`✅ Encontradas ${busqueda.length} consultas con "usuarios":`);
    busqueda.forEach(consulta => {
      console.log(`  • "${consulta.titulo}" por ${consulta.autor}`);
    });
    
    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('💡 Tu base de datos está lista para usar con el API');
    
  } catch (error) {
    console.error('\n❌ Error durante las pruebas:');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Soluciones posibles:');
      console.log('  1. Verifica que MySQL esté corriendo');
      console.log('  2. Revisa las credenciales en el archivo');
      console.log('  3. Asegúrate que el puerto 3306 esté disponible');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 La base de datos no existe.');
      console.log('  Ejecuta primero: CREATE DATABASE queryvaul;');
    }
    
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔒 Conexión cerrada');
    }
  }
}

// Ejecutar las pruebas
console.log('🧪 Iniciando pruebas de conexión y datos...\n');
probarConexion();
//hacemos la conexion a la base de datos
const { Pool } = require('pg');

const client = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database:process.env.DB_DATABASE,
    password:process.env.DB_PASSWORD,
    port:process.env.DB_PUERTO,
});

client.connect((error) => {
    if (error) {
        console.error('El error de conexión es: ' + error);
    return;
    }
    console.log('¡Conectado a la Base de Datos!');
});
//Exportar la base de datos
module.exports = client;
const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config({path: './env/.env'})

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    multipleStatements: true
})

db.connect((error) =>{
    if(error){
        console.log("error de conexion: " + error.message);
    }else{
        console.log("connected to database");
    }
})

module.exports = db
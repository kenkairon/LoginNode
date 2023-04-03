//1-Invocamos a express
const express= require('express');
const app = express();

//2-Seteamos urlencoded para capturar los datos del formulario
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//3-invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

//4-el directorio public
app.use('/resources',express.static('public'));
app.use('/resources',express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/partials'));
//5 -Establecemos el motor de plantillas
app.set('view engine','ejs');

//7 - Var. de session
const session = require('express-session');
app.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized:true
}));

// routes
//es para usar en la carpeta app import
app.use('/', require('./routes/routes'));

//función para limpiar la caché luego del logout
app.use(function(req, res, next) {
    if (!req.email)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

app.listen(3000,(req,res)=>{
    console.log('Server running in http://localhost:3000');
})

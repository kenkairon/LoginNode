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

//5 -Establecemos el motor de plantillas
app.set('view engine','ejs');

//6 -Invocamos a bcryptjs
const bcrypt = require('bcryptjs');

//7 - Var. de session
const session = require('express-session');
app.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized:true
}));

//8 invocamos al módulo de la conexión es ;
const conexion = require('./database/db');

// app.get('/',(req,res)=>{
//     res.render('index',{ msg:'Este es un mensaje desde node'});
// })
//9 Establecemos las rutas
app.get('/login',(req,res)=>{
    res.render('login');
})
app.get('/register',(req,res)=>{
    res.render('register');
})


//10 - Método para el registro
app.post('/register',async(req,res)=>{
    const email= req.body.email;
    const pass = req.body.password;

    let passwordHassh = await bcrypt.hash(pass,8);
    conexion.query('INSERT INTO usuarios (email,password) VALUES ($1, $2)', [email,passwordHassh], async(error, results) => {
        if (error) {
        console.log(error);
        } else {
        //req.flash('success', 'Estudiante Agregado Correctamente')
            res.render('register',{
                alert:true,
                alertTitle:"registrado",
                alertMessage:"Registro Satisfactorio",
                alertIcon:"success",
                showConfirmButton:false,
                timer:1500,
                ruta:''
            });
        }
    })
})

app.post('/auth', async (req, res)=> {
    const email = req.body.email;
    const pass = req.body.password;
    let passwordHash = await bcrypt.hash(pass, 8);
    if (email && pass) {
        conexion.query('SELECT password, email FROM usuarios WHERE email = $1 ', [email], async (error, results, fields)=> {
            console.log(results.rows)
            console.log(results.rows[0].password)
            console.log(passwordHash)
            console.log(pass)
            if( results.rows.length === 0 || !(await bcrypt.compare(pass, results.rows[0].password)) ) {
                res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "USUARIO y/o PASSWORD incorrectas",
                        alertIcon:'error',
                        showConfirmButton: true,
                        timer: 1500,
                        ruta: 'login'
                    });
                //Mensaje simple y poco vistoso
                //res.send('Incorrect Username and/or Password!');
            } else {
                //creamos una var de session y le asignamos true si INICIO SESSION
                req.session.loggedin = true;
                req.session.email = results.rows[0].email;
                res.render('login', {
                    alert: true,
                    alertTitle: "Conexión exitosa",
                    alertMessage: "¡LOGIN CORRECTO!",
                    alertIcon:'success',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: ''
                });
            }
            // Colocar res.end() aquí para evitar el error
            res.end();
        });
    } else {
        res.render('login', {
            alert: true,
            alertTitle: "Incorrecto",
            alertMessage: "¡INGRESE LOS DOS CAMPOS PORFAVOR CORREO Y PASSWORD!",
            alertIcon:'success',
            showConfirmButton: false,
            timer: 1500,
            ruta: 'login'
        });
    }
});

//12 - Método para controlar que está auth en todas las páginas
app.get('/',(req, res)=> {
	if (req.session.loggedin) {
		res.render('index',{
			login: true,
			email: req.session.email,
		});
	} else {
		res.render('index',{
			login:false,
			email:'Debe iniciar sesión',
		});
	}
	res.end();
});

//función para limpiar la caché luego del logout
app.use(function(req, res, next) {
    if (!req.email)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

 //Logout
//Destruye la sesión.
app.get('/logout', function (req, res) {
	req.session.destroy(() => {
	  res.redirect('/') // siempre se ejecutará después de que se destruya la sesión
	})
});



app.listen(3000,(req,res)=>{
    console.log('Server running in http://localhost:3000');
})

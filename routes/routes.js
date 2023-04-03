
//1-Invocamos a express
const express= require('express');
const routes = express();

//8 invocamos al módulo de la conexión es ;
const conexion = require('../database/db');

//6 -Invocamos a bcryptjs
const bcrypt = require('bcryptjs');

//9 Establecemos las rutas
routes.get('/login',(req,res)=>{
    res.render('login');
})
routes.get('/register',(req,res)=>{
    res.render('register');
})

//10 - Método para el registro
routes.post('/register',async(req,res)=>{
    const email= req.body.email;
    const pass = req.body.password;
    //Se encripta la pass
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
                ruta:'login'
            });
        }
    })
})
routes.post('/auth', async (req, res)=> {
    const email = req.body.email;
    const pass = req.body.password;
    let passwordHash = await bcrypt.hash(pass, 8);
    if (email && pass) {
        conexion.query('SELECT password, email FROM usuarios WHERE email = $1 ', [email], async (error, results, fields)=> {
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
routes.get('/', async (req, res) => {
    try {
        const results = await conexion.query('SELECT * FROM usuarios ORDER BY email ASC');
        if (req.session.loggedin) {
            res.render('index', {
                login: true,
                email: req.session.email,
                results: results.rows,
                message:"Bienvenido a la tabla usuarios",
                iconoemail:"https://cdn3.iconfinder.com/data/icons/folder-vol-1-1/512/Contacts.png",
                icono:"https://cdn1.iconfinder.com/data/icons/space-travel-flat/340/space_astronomy_universe_galaxy_astronaut_cosmonaut_science_spaceman_travel-1024.png",
                icono2:"https://cdn0.iconfinder.com/data/icons/marketly-seo-marketing-3d/512/8._Market_Launch.png"

            });
        } else {
            res.render('index', {
                login: false,
                email: 'Debe iniciar sesión'
            });
        }
    } catch (error) {
        throw error;
    }
});
 //Logout
//Destruye la sesión.
routes.get('/logout', function (req, res) {
	req.session.destroy(() => {
	  res.redirect('/') // siempre se ejecutará después de que se destruya la sesión
	})
});

module.exports = routes;

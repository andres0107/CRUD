// =======================
// Paquetes que se necesitan
// =======================
const express     = require('express');
const app         = express();
const bodyParser  = require('body-parser');
const morgan      = require('morgan');
const mongoose    = require('mongoose');

const jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
const config = require('./config'); // get our config file
const User   = require('./app/models/user'); // get our mongoose model

// ---------------
// Configuracion
// ---------------

const port= process.env.PORT || 8080; //Usado para crear, Loguear, verificar los tokens
mongoose.connect(config.database); //Conectar a la base de datos.
app.set('superSecret', config.secret); //Variable secreta

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded( { extended : false}));
app.use(bodyParser.json());

//use morgan for log request to the console
app.use(morgan('dev'));

// ----------------------
// Rutas de la aplicación
// ---------------------
var apiRoutes = express.Router(); 

//route to authenticate a user (POST http://localhost:8080/api/authenticate) for mildwire
apiRoutes.post('/authenticate', function(req, res){
    User.findOne({
        name: req.body.name
    }, function(err, user){
        if(err) throw err;

        if(!user) {
            res.json({ 
                success : false, 
                message: "Fallo en la autnetificación del usuario, usuario no encontrado"
            })
        } else if(user) {

            if(user.password != req.body.password) {
                res.json({ 
                    success : false, 
                    message: "Fallo en la autnetificación del usuario, Contraseña mala"
                })
            } else{
                //Si el usuario es encontrado y la contraseña es correcta
                //Se crea el token solo con el payloard

                const payload ={
                    admin : user.admin
                };

                let token = jwt.sign(payload, app.get('superSecret'), {
                    expiresIn : "24h"
                });

                //retornar la informacion incluido el token json

                res.json({
                    success: true,
                    message: 'Welcome body',
                    token: token
                });
            }
        }
    })
})


// route middleware to verify a token
apiRoutes.use(function(req, res, next) {

    let token = req.body.token || req.query.token || req.header['x-access-token'];

    if(token){
        jwt.verify(token, app.get('superSecret'), function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });    
              } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;    
                next();
              }
        })
    } else {
        return res.status(403).send({
            success: false,
            message: "No token"
        })
    }
});

//Ruta basica   
app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// get an instance of the router for api routes
// TODO: route to authenticate a user (POST http://localhost:8080/api/authenticate)

apiRoutes.get('/', function(req, res){
    res.json({message : 'Welcome to the coolest API'})
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function(req, res){
    User.find({}, function(err, users){
        res.json(users);
    })
});


app.use('/api' , apiRoutes);

// Crear usuario

app.get('/setup', function(req, res){
    //Crear un usuario
    let user = new User({
        name: "Juan",
        password: 'password',
        admin: true
    });

    //Guardar el registro del ususario

    user.save(function(err){
        if(err) throw err;

        console.log('Usuario guardado exitosamente');
        res.json({success: true});
    });
});

app.listen(port);
console.log("La magia ocurre en el puerto" + port);
// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParse = require('body-parser');


// Inicializar variables
var app = express();

//CORS
app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Acess-Control-Allow-Methods", "POST, GET, PUT, DELETE");
    next();
});

// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require("./routes/usuario");
var loginRoutes = require("./routes/login");
var hospitalRoutes = require("./routes/hospital");
var medicosRoutes = require("./routes/medico");
var busquedaRoutes = require("./routes/busqueda");
var uploadRoutes = require("./routes/upload");
var imagesRoutes = require("./routes/imagenes");

// parse
app.use(bodyParse.urlencoded({extended: false}));
app.use(bodyParse.json());

// Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/HospitalDB', (err, res) =>{

    if(err) throw err;

    console.log("Base de datos: \x1b[32m%s\x1b[0m", " online");
});


// Rutas
app.use("/usuario", usuarioRoutes);
app.use("/login", loginRoutes);
app.use("/hospital", hospitalRoutes);
app.use("/medico", medicosRoutes);
app.use("/busqueda", busquedaRoutes);
app.use("/upload", uploadRoutes);
app.use("/img", imagesRoutes);
app.use("/", appRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m',' online');
});



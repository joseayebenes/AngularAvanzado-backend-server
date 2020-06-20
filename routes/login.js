var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require("../models/usuario");

app.post('/', (req,res)=>{
        
    var body = req.body;
    Usuario.findOne({email: body.email}, (err, usuarioDb) =>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: err,
                });
        }

        if(!usuarioDb){
            return res.status(400).json({
              ok: false,
              mensaje: "Credenciales incorrectas - email"
            });
        }

        if(!bcrypt.compareSync(body.password, usuarioDb.password)){
            return res.status(400).json({
            ok: false,
            mensaje: "Credenciales incorrectas - password",
            }); 
        }

        // CREAR UN TOKEN
        usuarioDb.password = ':)';
        var token = jwt.sign({ usuario: usuarioDb }, SEED, {
          expiresIn: 14400,
        });

        return res.status(200).json({
          ok: true,
          usuario: usuarioDb,
          id: usuarioDb.id,
          token: token
        });
    
    })
    
});


module.exports = app;
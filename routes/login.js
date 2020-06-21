var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').CLIENT_ID;

var app = express();

// google
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);


var Usuario = require("../models/usuario");

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID, 
  });
  const payload = ticket.getPayload();
  const userid = payload["sub"];
  // If request specified a G Suite domain:
  // const domain = payload['hd'];
  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  };
};

app.post("/google",async (req, res) => {
  var token = req.body.token;

  var googleUser = await verify(token)
        .catch((e =>{
              return res.status(403).json({
                ok: false,
                mensaje: "Token no válido",
              });
        }));

  
  Usuario.findOne({email: googleUser.email}, (err, usuarioDb)=>{
    if(err){
        return res.status(500).json({
            ok: false,
            mensaje: "Error al buscar usuario",
            errors: err,
            });
    }
    
    if(usuarioDb){

      if (usuarioDb.google === false){

        return res.status(400).json({
          ok: false,
          mensaje: "No se puede autenticar con google"
        });

      }else{
        // CREAR UN TOKEN
          usuarioDb.password = ':)';
          var token = jwt.sign({ usuario: usuarioDb }, SEED, {
            expiresIn: 14400,
          });

          return res.status(200).json({
            ok: true,
            usuario: usuarioDb,
            id: usuarioDb._id,
            token: token
          });
      }
    }else{

      var usuario = new Usuario();
      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password= ':)';

      usuario.save((err, usuarioDb)=>{

        // CREAR UN TOKEN
          usuarioDb.password = ':)';
          var token = jwt.sign({ usuario: usuarioDb }, SEED, {
            expiresIn: 14400,
          });

          return res.status(200).json({
            ok: true,
            usuario: usuarioDb,
            id: usuarioDb._id,
            token: token
          });
      
      });
    }
  });

});


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
          id: usuarioDb._id,
          token: token
        });
    
    })
    
});





module.exports = app;
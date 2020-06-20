var express = require("express");
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

app.use(fileUpload());

var Usuario = require('../models/usuario');
var Medico = require("../models/medico");
var Hospital = require("../models/hospital");


app.put("/:tipo/:id", (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if(tiposValidos.indexOf(tipo)<0){
        return res.status(400).json({
          ok: false,
          mensaje: "Tipo no válido",
          errors: { message: "Los tipos válidos son " + tiposValidos.join(', ') },
        });
    }

    if(!req.files){
        return res.status(400).json({
          ok: false,
          mensaje: "No selecciono nada",
          errors: { message: "Debe seleccionar una imagen" },
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length-1];

    // Solo estas extensiones 
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if(extensionesValidas.indexOf(extensionArchivo)< 0){
        return res.status(400).json({
          ok: false,
          mensaje: "Extensión no válida",
          errors: { message: "Las extensiones válidas son " + extensionesValidas.join(', ') },
        });
    }

    // Nombre de archivo personalizado

    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover archivo
    var path = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv(path, err =>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: "Error al mover archivo",
                errors: err 
            });
        }
    });


    subirPorTipo(tipo, id, nombreArchivo, res);


});


function subirPorTipo(tipo, id, nombreArchivo, res){

    if(tipo == 'usuarios'){

        Usuario.findById(id, (err, usuario)=>{
            
            if(!usuario){
                return res.status(400).json({
                  ok: false,
                  mensaje: "Usuario no encontrado",
                  errors: {
                    message:
                      "Usuario no encontrado ",
                  },
                });
            }
            var pathViejo = './uploads/usuarios/'+usuario.img;

            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado)=>{
                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de usuario actualizado",
                    usuario: usuarioActualizado
                });
            });

        });

    }

    if(tipo == 'medicas'){
        Medico.findById(id, (err, medico) => {
        if (!medico) {
          return res.status(400).json({
            ok: false,
            mensaje: "medico no encontrado",
            errors: {
              message: "medico no encontrado ",
            },
          });
        }
        var pathViejo = "./uploads/medicos/" + medico.img;

        if (fs.existsSync(pathViejo)) {
            fs.unlink(pathViejo);
        }

        medico.img = nombreArchivo;

        medico.save((err, medicoActualizado) => {
          return res.status(200).json({
            ok: true,
            mensaje: "Imagen de medico actualizado",
            usuario: medicoActualizado,
          });
        });
        });
    }

    if(tipo == 'hospitales'){
        Hospital.findById(id, (err, hospital) => {
        if (!hospital) {
          return res.status(400).json({
            ok: false,
            mensaje: "hospital no encontrado",
            errors: {
              message: "hospital no encontrado ",
            },
          });
        }
        var pathViejo = "./uploads/hospitales/" + hospital.img;

        if (fs.existsSync(pathViejo)) {
            fs.unlink(pathViejo);
        }

        hospital.img = nombreArchivo;

        hospital.save((err, hospitalActualizado) => {
          return res.status(200).json({
            ok: true,
            mensaje: "Imagen de hospital actualizado",
            usuario: hospitalActualizado,
          });
        });
        });
    }

}

module.exports = app;

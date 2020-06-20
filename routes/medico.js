var express = require("express");
var mdAutenticacion = require("../middlewares/autenticacion");

var app = express();


var Medico = require("../models/medico");

app.get("/", (req, res, next) => {
  
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Medico.find({}, "nombre img")
    .skip(desde)
    .limit(5)
    .populate("usuario", "nombre email")
    .populate("hospital")
    .exec((err, medicos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando médicos",
          errors: err,
        });
      }

      Medico.count({}, (err, conteo) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: "Error contando medicos",
            errors: err,
          });
        }
        res.status(200).json({
          ok: true,
          medicos: medicos,
          total: conteo,
        });
      });
    });
});

app.post("/", mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;
  var usuario = req.usuario;

  var medico = new Medico({
    nombre: body.nombre,
    //img: body.img,
    usuario: usuario._id,
    hospital: body.hospital
  });

  medico.save((err, medicoGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error guardando médico",
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      medico: medicoGuardado,
    });
  });
});

app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Medico.findById(id, (err, medico) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error buscando médico",
        errors: err,
      });
    }

    if (!medico) {
      return res.status(400).json({
        ok: false,
        mensaje: "El medico con el id" + id + "no existe",
        errors: { message: "No existe el medico" },
      });
    }

    medico.nombre = body.nombre;
    //medico.img = body.img;
    medico.usuario = req.usuario._id;
    medico.hospital = body.hospital;

    medico.save((err, medicoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar medico",
          errors: err,
        });
      }
      return res.status(200).json({
        ok: true,
        hospital: medicoGuardado,
      });
    });
  });
});

app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;

  Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al eliminar medico",
        errors: err,
      });
    }

    if (!medicoBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe medico con ese id",
      });
    }

    res.status(201).json({
      ok: true,
      usuario: medicoBorrado,
    });
  });
});


module.exports = app;

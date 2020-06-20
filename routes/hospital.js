var express = require("express");
var mdAutenticacion = require("../middlewares/autenticacion");

var app = express();
var Hospital = require("../models/hospital");

app.get("/", (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
  Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate("usuario", "nombre email")
    .exec((err, hospitales) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando hospitales",
          errors: err,
        });
      }

      Hospital.count({}, (err, conteo) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: "Error contando hospitales",
            errors: err,
          });
        }
        res.status(200).json({
          ok: true,
          hospitales: hospitales,
          total: conteo,
        });
      });
    });
});

app.post("/", mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;
  var usuario = req.usuario;

  var hospital = new Hospital({
    nombre: body.nombre,
    //img: body.img,
    usuario: usuario._id,
  });

  hospital.save((err, hospitalGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error guardando hospital",
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      hospital: hospitalGuardado,
    });
  });
});

app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Hospital.findById(id, (err, hospital) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error buscando hospital",
        errors: err,
      });
    }

    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mensaje: "El hospital con el id" + id + "no existe",
        errors: { message: "No existe el hospital" },
      });
    }

    hospital.nombre = body.nombre;
    //hospital.img = body.img;
    hospital.usuario = req.usuario._id;

    hospital.save((err, hospitalGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar hospital",
          errors: err,
        });
      }
      return res.status(200).json({
        ok: true,
        hospital: hospitalGuardado,
      });

    });
  });
});


app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;

  Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al eliminar hospital",
        errors: err,
      });
    }

    if(!hospitalBorrado){
        return res.status(400).json({
          ok: false,
          mensaje: "No existe hospital con ese id",
        });
    }

    res.status(201).json({
      ok: true,
      usuario: hospitalBorrado,
    });
  });
});


module.exports = app;

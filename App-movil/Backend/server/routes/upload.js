const express = require('express');
const fileUpload = require('express-fileupload');
const uniqid = require('uniqid');
const path = require('path');
const fs = require('fs');
const app = express();
const Usuario = require('../models/usuario');
app.use(fileUpload());

app.put('/upload/:ruta/:id', (req, res) => {
    let id = req.params.id;
    let ruta = req.params.ruta;
    let archivo = req.files.archivo;
    let nombre = uniqid() + path.extname(archivo.name);

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningun archivo'
            }
        });
    }
    let validExtensions = ['image/png', 'image/jfif', 'image/gif', 'image/jpeg', 'image/jpg'];
    if (!validExtensions.includes(archivo.mimetype)) {
        return res.status(400).json({
            ok: false,
            err: {
                message: "solo exensiones <png,jpg,gif,jpeg, jfif> son validas"
            }
        });
    }
    archivo.mv(`../uploads/${ruta}/${nombre}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
    });
    switch (ruta) {
        case 'usuario':
            imagenUsuario(id, res, nombre);
            break;
        default:
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Ruta no valida'
                }
            });
            break;
    }
});

function imagenUsuario(id, res, nombreImagen) {
    Usuario.findById(id, (err, usr) => {
        if (err) {
            borrarArchivo(nombreImagen, 'usuario');
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //validar la respuesta
        if (!usr) {
            borrarArchivo(nombreImagen, 'usuario');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }
        usr.img = nombreImagen;

        //Usuario.findByIdAndUpdate
        usr.save((err, usrDB) => {
            if (err) {
                borrarArchivo(nombreImagen, 'usuario');
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            return res.status(200).json({
                ok: true,
                usrDB
            });
        });
    });
}

function borrarArchivo(nombreImagen, ruta) {
    let pathImg = path.resolve(__dirname, `./uploads/${ruta}/${nombreImagen}`);
    if (fs.existsSync(pathImg)) {
        fs.unlinkSync(pathImg);
    }
    console.log('Imagen borrada con exito');
}
module.exports = app;
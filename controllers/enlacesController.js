const Enlaces = require('../models/Enlace');
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator');

exports.nuevoEnlace = async (req, res, next) => {
    //Revisar errores
    const errores = validationResult(req);
    if(!errores.isEmpty()) {
        return res.status(400).json({errores: errores.array()})
    }

    //Crear un objeto enlace
    const {nombre_original} = req.body;
    const enlace = new Enlaces();

    enlace.url = shortid.generate();
    enlace.nombre = shortid.generate();
    enlace.nombre_original = nombre_original;

    //Si el usuario esta registrado
    if(req.usuario) {
        const { password, descargas} = req.body;

        //Asignar a enlace el numero de descargas
        if(descargas) {
            enlace.descargas = descargas;
        }

        //Asignar un password
        if(password) {
            const salt = await bcrypt.genSalt(10);
            enlace.password = await bcrypt.hash(password, salt);
        }

        //Asignar el autor
        enlace.autor = req.usuario.id
    }

    //ALMACENAR EN LA BD
    try {
        await enlace.save();
        return res.json({msg: `${enlace.url}`});
        next();
    } catch (error) {
        console.log(error)
    }



}

//Obtener el enlace
exports.obtenerEnlace =  async (req, res, next) => {
    const {url} = req.params;
    //Verificar si existe el enlce
    const enlace = await Enlaces.findOne({url});
    if(!enlace) {
        res.status(404).json({msg: 'Ese Enlace no existe'});
        return next();
    }
    //Si el enlace existe
    res.json({archivo: enlace.nombre});
    const {descargas, nombre} = enlace;
    if(descargas === 1) {
        req.archivo = nombre;
        //Eliminar la entrada en la BD
        await Enlaces.findOneAndRemove(req.params.url);
        //Farem sa logica de eliminar s'archiu a nes seguent midleware definit a ses routes. archivos.eliminarArchivo
        next();
    } else {
        enlace.descargas--;
        await enlace.save();
    }
}
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const {check} = require('express-validator');

router.post('/',
    [
        check('nombre', 'El Nombre es Obligatorio').not().isEmpty(),
        check('email', 'Agrega un Email Valido').isEmail(),
        check('password', 'El password es demasiado corto').isLength({min: 6})
    ],
    usuarioController.nuevoUsuario
);

module.exports = router;
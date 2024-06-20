const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController');

// Rutas para los distintos tipos de registros
router.post('/registro', registroController.registrarUsuario);
router.post('/registro-adulto', registroController.registrarDatosAdulto);
router.post('/registro-profesional', registroController.registrarDatosProfesional);
router.post('/registro-nino', registroController.registrarDatosNino);
router.post('/login', registroController.login);
router.post('/crear-cita', registroController.crearCita);
router.post('/gestionar-cita', registroController.gestionarCita);


module.exports = router;

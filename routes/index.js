const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController');

// Rutas para los distintos tipos de registros
router.post('/registro', registroController.registrarUsuario);
router.post('/registro-adulto', registroController.registrarDatosAdulto);
router.post('/registro-profesional', registroController.registrarDatosProfesional);
router.post('/login', registroController.login);
router.get('/psicologos', registroController.obtenerPsicologos);

// Ruta para crear una cita
router.post('/crear', registroController.crearCita);
router.get('/citas/psicologos', registroController.obtenerPsicologos);
router.post('/citas/crear', registroController.crearCita);
router.post('/citas/obtener', registroController.obtenerCitas);
router.post('/citas/cancelar', registroController.cancelarCita);

router.post('/verificar-clave', registroController.verificarClaveAutorizacion);

router.post('/perfil', registroController.obtenerPerfilUsuario);

router.post('/citas/pendientes', registroController.citasPendientes);
router.get('/citas/detalles/:id', registroController.detallesCita);
router.post('/citas/actualizar/:id', registroController.actualizarCita);
router.post('/obtener-profesional', registroController.obtenerCitasProfesional);

router.post('/obtener-perfil', registroController.obtenerPerfilProfesional);



module.exports = router;

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const indexRoutes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar el directorio de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configurar rutas
app.use('/api', indexRoutes);

// Configura el motor de vistas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Directorio para las vistas

app.get('/', (req, res) => {
    res.render('PaginaPrincipal');
});

app.get('/Registro', (req, res) => {
    res.render('RegistroF1');
});

app.get('/RegistroA', (req, res) => {
    res.render('RegistroAdultos');
});

app.get('/RegistroP', (req, res) => {
    res.render('RegistroProfesional');
});

app.get('/Login', (req, res) => {
    res.render('InicioSesion');
});

app.get('/A', (req, res) => {
    res.render('Adultos/PaginaPrincipalA');
});

app.get('/AgentarCita', (req, res) => {
    res.render('Adultos/AgendarCita');
});

app.get('/MisCitasA', (req, res) => {
    res.render('Adultos/Miscitas');
});

app.get('/MiPerfilA', (req, res) => {
    res.render('Adultos/PerfilA');
});


app.get('/QuienesSomos', (req, res) => {
    res.render('Adultos/QuienesSomos');
});


//Profesionales

app.get('/P', (req, res) => {
    res.render('Profesionales/PaginaPrincipalP');
});

app.get('/MiscitasP', (req, res) => {
    res.render('Profesionales/MiscitasP');
});

app.get('/Solicitudes-Citas', (req, res) => {
    res.render('Profesionales/SolicitudesCitas');
});

app.get('/MiPerfil', (req, res) => {
    res.render('Profesionales/MiPerfil');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
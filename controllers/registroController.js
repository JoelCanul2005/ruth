const mysql = require('mysql2');
const nodemailer = require('nodemailer');

// Configurar la conexión a la base de datos
const db = mysql.createConnection({
    host: 'monorail.proxy.rlwy.net',
    user: 'root',
    password: 'uYrJgtoWJqzKpKrlazRNmWLaQfsAUSfA',
    database: 'railway',
    port: 16814
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos');
});

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
    service: 'Outlook365',
    auth: {
        user: 'webpsyoficial@outlook.com',
        pass: 'Canmcan12@'
    }
});

// Función para enviar correos
const enviarCorreo = (email, subject, text) => {
    const mailOptions = {
        from: 'webpsyoficial@outlook.com',
        to: email,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.error('Error enviando correo:', error);
        }
        console.log('Correo enviado:', info.response);
    });
};

// Función para generar una clave de autorización simple
const generarClaveAutorizacion = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let clave = '';
    for (let i = 0; i < 8; i++) {
        const indice = Math.floor(Math.random() * caracteres.length);
        clave += caracteres.charAt(indice);
    }
    return clave;
};

// Verificar correo electrónico único
const verificarCorreoUnico = (email) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM usuarios WHERE email = ?';
        db.query(sql, [email], (err, results) => {
            if (err) {
                reject(err); // Rechaza la promesa si hay un error
            } else {
                resolve(results.length === 0); // Resuelve true si no hay resultados (correo único)
            }
        });
    });
};

// Verificar unicidad de la clave de autorización en la tabla adultos
const verificarClaveUnica = (clave) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM adultos WHERE clave_autorizacion = ?';
        db.query(sql, [clave], (err, results) => {
            if (err) {
                reject(err); // Rechaza la promesa si hay un error
            } else {
                resolve(results.length === 0); // Resuelve true si no hay resultados (clave única)
            }
        });
    });
};

// Controlador para registrar usuario
exports.registrarUsuario = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        // Validar datos (ejemplo básico)
        if (!email || !password || !role) {
            return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios' });
        }

        // Verificar si el correo electrónico ya está registrado
        const correoUnico = await verificarCorreoUnico(email);
        if (!correoUnico) {
            return res.status(400).json({ success: false, error: 'El correo electrónico ya está registrado' });
        }

        // Insertar nuevo usuario
        const insertQuery = 'INSERT INTO usuarios (email, password, role) VALUES (?, ?, ?)';
        db.query(insertQuery, [email, password, role], (insertError, insertResults) => {
            if (insertError) {
                console.error('Error registrando usuario:', insertError);
                return res.status(500).json({ success: false, error: 'Error registrando usuario' });
            }

            res.status(200).json({ success: true, userId: insertResults.insertId });
        });

    } catch (error) {
        console.error('Error al verificar correo electrónico único:', error);
        return res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
};

exports.registrarDatosAdulto = async (req, res) => {
    const { userId, nombre, snombre, apellido, sapellido, fechanacimiento, ciudad, estado, direccion, curp } = req.body;

    try {
        // Verificar si el usuario_id ya está registrado
        const checkUserIdQuery = 'SELECT * FROM adultos WHERE usuario_id = ?';
        const checkUserIdResults = await db.promise().query(checkUserIdQuery, [userId]);
        if (checkUserIdResults[0].length > 0) {
            return res.status(400).json({ success: false, error: 'El usuario_id ya está registrado' });
        }

        // Verificar si el CURP ya está registrado
        const checkCurpQuery = 'SELECT * FROM adultos WHERE curp = ?';
        const checkCurpResults = await db.promise().query(checkCurpQuery, [curp]);
        if (checkCurpResults[0].length > 0) {
            return res.status(400).json({ success: false, error: 'El CURP ya está registrado' });
        }

        // Generar y verificar la unicidad de la clave de autorización
        let claveAutorizacion;
        let claveUnica = false;

        while (!claveUnica) {
            claveAutorizacion = generarClaveAutorizacion();
            claveUnica = await verificarClaveUnica(claveAutorizacion);
        }

        // Obtener el correo electrónico del usuario
        const getEmailQuery = 'SELECT email FROM usuarios WHERE id = ?';
        const emailResults = await db.promise().query(getEmailQuery, [userId]);
        if (emailResults[0].length > 0) {
            const correo = emailResults[0][0].email;

            // Si todo está bien, insertar los datos del adulto
            const insertQuery = 'INSERT INTO adultos (id, usuario_id, nombre, snombre, apellido, sapellido, fechanacimiento, ciudad, estado, direccion, curp, clave_autorizacion, correo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const values = [userId, userId, nombre, snombre, apellido, sapellido, fechanacimiento, ciudad, estado, direccion, curp, claveAutorizacion, correo];

            await db.promise().query(insertQuery, values);

            const subject = 'Registro de Adulto Exitoso';
            const text = `Hola ${nombre},\n\nTu clave de autorización es: ${claveAutorizacion}\n\nSaludos,\nEquipo de Citas`;

            // Enviar correo con la clave de autorización
            enviarCorreo(correo, subject, text);
        } else {
            return res.status(400).json({ success: false, error: 'Correo del usuario no encontrado' });
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.error('Error en registrarDatosAdulto:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
};



exports.registrarDatosProfesional = async (req, res) => {
    const { userId, nombre, snombre, apellido, sapellido, fechanacimiento, ciudad, estado, direccion, curp, cedula_profesional } = req.body;

    try {
        // Verificar si el usuario_id ya está registrado como profesional
        const checkUserIdQuery = 'SELECT * FROM profesionales WHERE usuario_id = ?';
        const checkUserIdResults = await db.promise().query(checkUserIdQuery, [userId]);
        if (checkUserIdResults[0].length > 0) {
            return res.status(400).json({ success: false, error: 'El usuario ya está registrado como profesional' });
        }

        // Verificar si el CURP ya está registrado
        const checkCurpQuery = 'SELECT * FROM profesionales WHERE curp = ?';
        const checkCurpResults = await db.promise().query(checkCurpQuery, [curp]);
        if (checkCurpResults[0].length > 0) {
            return res.status(400).json({ success: false, error: 'El CURP ya está registrado' });
        }

        // Verificar si la cédula profesional ya está registrada
        const checkCedulaQuery = 'SELECT * FROM profesionales WHERE cedula_profesional = ?';
        const checkCedulaResults = await db.promise().query(checkCedulaQuery, [cedula_profesional]);
        if (checkCedulaResults[0].length > 0) {
            return res.status(400).json({ success: false, error: 'La cédula profesional ya está registrada' });
        }

        // Generar y verificar la unicidad de la clave de autorización
        let claveAutorizacion;
        let claveUnica = false;

        while (!claveUnica) {
            claveAutorizacion = generarClaveAutorizacion();
            claveUnica = await verificarClaveUnica(claveAutorizacion);
        }

        // Obtener el correo electrónico del usuario
        const getEmailQuery = 'SELECT email FROM usuarios WHERE id = ?';
        const emailResults = await db.promise().query(getEmailQuery, [userId]);
        if (emailResults[0].length > 0) {
            const correo = emailResults[0][0].email;

            // Insertar los datos del profesional
            const insertQuery = 'INSERT INTO profesionales (id, usuario_id, nombre, snombre, apellido, sapellido, fechanacimiento, ciudad, estado, direccion, curp, cedula_profesional, clave_autorizacion, correo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const values = [userId, userId, nombre, snombre, apellido, sapellido, fechanacimiento, ciudad, estado, direccion, curp, cedula_profesional, claveAutorizacion, correo];

            await db.promise().query(insertQuery, values);

            // Enviar correo con la clave de autorización
            const subject = 'Registro de Profesional Exitoso';
            const text = `Hola ${nombre},\n\nTu clave de autorización es: ${claveAutorizacion}\n\nSaludos,\nEquipo de Citas`;
            enviarCorreo(correo, subject, text);

            res.status(200).json({ success: true });
        } else {
            res.status(400).json({ success: false, error: 'Correo del usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error en registrarDatosProfesional:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
};




exports.login =(req, res)=>{
    const { email, password } = req.body;

  // Consultar la base de datos para obtener el rol del usuario
  const sql = 'SELECT id, role FROM usuarios WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error('Error al buscar usuario en la base de datos:', err);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
      return;
    }

    if (results.length === 0) {
      res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
      return;
    }

    const { id, role } = results[0];
    res.status(200).json({ success: true, userId: id, role: role });
  });
  

}

const verificarDisponibilidadPsicologo = (psicologoId, fecha, hora) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM citas WHERE psicologo_id = ? AND fecha = ? AND hora = ?';
        db.query(sql, [psicologoId, fecha, hora], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.length === 0); // True si está disponible
            }
        });
    });
};

// Obtener el correo electrónico del usuario
const obtenerCorreoUsuario = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT email FROM usuarios WHERE id = ?';
        db.query(sql, [userId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.length > 0 ? results[0].email : null);
            }
        });
    });
};

// Crear una cita
exports.crearCita = async (req, res) => {
    const { motivo, fecha, hora, psicologoId, claveAutorizacion } = req.body;

    try {
        // Verificar la clave de autorización
        const [adulto] = await db.promise().query('SELECT * FROM adultos WHERE clave_autorizacion = ?', [claveAutorizacion]);
        if (adulto.length === 0) {
            console.log('Clave de autorización no válida');
            return res.status(400).json({ success: false, error: 'Clave de autorización no válida' });
        }

        const { id: adultoId, correo } = adulto[0];
        console.log(`Adulto encontrado: ${adultoId}`);

        // Obtener datos del psicólogo
        const [psicologo] = await db.promise().query('SELECT * FROM profesionales WHERE id = ?', [psicologoId]);
        if (psicologo.length === 0) {
            console.log('Psicólogo no encontrado');
            return res.status(400).json({ success: false, error: 'Psicólogo no encontrado' });
        }
        console.log('Psicólogo encontrado:', psicologo[0]);

        // Verificar disponibilidad del psicólogo
        const [citas] = await db.promise().query('SELECT * FROM citas WHERE psicologo_id = ? AND fecha = ? AND hora = ?', [psicologoId, fecha, hora]);
        if (citas.length > 0) {
            console.log('El psicólogo ya tiene una cita en esta fecha y hora');
            return res.status(400).json({ success: false, error: 'El psicólogo ya tiene una cita en esta fecha y hora' });
        }

        // Crear cita
        const insertQuery = 'INSERT INTO citas (motivo, fecha, hora, psicologo_id, adulto_id, estado) VALUES (?, ?, ?, ?, ?, ?)';
        await db.promise().query(insertQuery, [motivo, fecha, hora, psicologoId, adultoId, 'pendiente']);
        console.log('Cita creada');

        // Obtener el correo electrónico del adulto desde la tabla adultos
        if (correo) {
            const psicologoInfo = psicologo[0];
            const subject = 'Confirmación de Cita';
            const text = `Hola,\n\nTu cita ha sido creada con éxito.\nMotivo: ${motivo}\nFecha: ${fecha}\nHora: ${hora}\nPsicólogo: ${psicologoInfo.nombre} ${psicologoInfo.snombre} ${psicologoInfo.apellido} ${psicologoInfo.sapellido}\n\nSaludos,\nEquipo de Citas`;

            // Enviar correo con los detalles de la cita
            transporter.sendMail({
                from: 'webpsyoficial@outlook.com',
                to: correo,
                subject: subject,
                text: text
            }, (emailError, info) => {
                if (emailError) {
                    console.error('Error al enviar el correo de confirmación:', emailError);
                    return res.status(500).json({ success: false, error: 'Error al enviar el correo de confirmación' });
                } else {
                    console.log('Correo enviado:', info.response);
                }
            });
        } else {
            console.log('Correo del usuario no encontrado');
            return res.status(400).json({ success: false, error: 'Correo del usuario no encontrado' });
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.error('Error al crear la cita:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
};



// Obtener lista de psicólogos
exports.obtenerPsicologos = (req, res) => {
    const sql = 'SELECT * FROM profesionales';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener psicólogos:', err);
            return res.status(500).json({ success: false, error: 'Error interno del servidor' });
        }
        res.json({ success: true, psicologos: results });
    });
};


// Obtener citas del usuario por clave de autorización
exports.obtenerCitas = async (req, res) => {
    const { claveAutorizacion } = req.body;

    try {
        const adultoQuery = 'SELECT id FROM adultos WHERE clave_autorizacion = ?';
        const [adultoResults] = await db.promise().query(adultoQuery, [claveAutorizacion]);

        if (adultoResults.length === 0) {
            return res.status(400).json({ success: false, error: 'Clave de autorización inválida' });
        }

        const adultoId = adultoResults[0].id;

        const citasQuery = `
    SELECT c.id, c.motivo, c.fecha, c.hora, c.estado, 
           p.nombre, p.snombre, p.apellido, p.sapellido
    FROM citas c
    JOIN profesionales p ON c.psicologo_id = p.id
    WHERE c.adulto_id = ?
`;


        const [citasResults] = await db.promise().query(citasQuery, [adultoId]);

        res.status(200).json({ success: true, citas: citasResults });
    } catch (error) {
        console.error('Error al obtener citas:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
};

// Cancelar cita
exports.cancelarCita = async (req, res) => {
    const { citaId } = req.body;

    try {
        const updateQuery = 'UPDATE citas SET estado = ? WHERE id = ?';
        await db.promise().query(updateQuery, ['cancelada', citaId]);

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error al cancelar la cita:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
};

// Ruta para verificar la clave de autorización
exports.verificarClaveAutorizacion = async (req, res) => {
    const { userId, authKey } = req.body;

    try {
        // Verificar clave para adultos
        const adultoQuery = 'SELECT * FROM adultos WHERE usuario_id = ? AND clave_autorizacion = ?';
        const [adultoResults] = await db.promise().query(adultoQuery, [userId, authKey]);

        if (adultoResults.length > 0) {
            return res.status(200).json({ success: true, role: 'adulto' });
        }

        // Verificar clave para profesionales
        const profesionalQuery = 'SELECT * FROM profesionales WHERE usuario_id = ? AND clave_autorizacion = ?';
        const [profesionalResults] = await db.promise().query(profesionalQuery, [userId, authKey]);

        if (profesionalResults.length > 0) {
            return res.status(200).json({ success: true, role: 'profesional' });
        }

        res.status(400).json({ success: false, error: 'Clave de autorización incorrecta' });

    } catch (error) {
        console.error('Error al verificar clave de autorización:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
};

exports.obtenerPerfilUsuarioPorClave = async (req, res) => {
    const claveAutorizacion = req.params.clave;  // Asumiendo que la clave de autorización se pasa como parámetro en la URL

    try {
        // Obtener datos del adulto utilizando la clave de autorización
        const [adultResults] = await db.promise().query('SELECT * FROM adultos WHERE clave_autorizacion = ?', [claveAutorizacion]);
        if (adultResults.length === 0) {
            return res.status(404).json({ success: false, error: 'Datos del adulto no encontrados' });
        }
        const adulto = adultResults[0];

        // Obtener datos de la tabla usuarios utilizando el usuario_id
        const [userResults] = await db.promise().query('SELECT email, role FROM usuarios WHERE id = ?', [adulto.usuario_id]);
        if (userResults.length === 0) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }
        const usuario = userResults[0];

        // Combinar datos
        const perfilUsuario = { ...usuario, ...adulto };

        res.status(200).json({ success: true, perfilUsuario });
    } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
};

exports.obtenerPerfilUsuario = async (req, res) => {
    const { claveAutorizacion } = req.body;

    try {
        // Buscar el adulto por la clave de autorización
        const [adultoResults] = await db.promise().query('SELECT * FROM adultos WHERE clave_autorizacion = ?', [claveAutorizacion]);

        if (adultoResults.length === 0) {
            return res.status(400).json({ success: false, error: 'Clave de autorización inválida' });
        }

        const adulto = adultoResults[0];

        // Buscar el usuario relacionado
        const [usuarioResults] = await db.promise().query('SELECT * FROM usuarios WHERE id = ?', [adulto.usuario_id]);

        if (usuarioResults.length === 0) {
            return res.status(400).json({ success: false, error: 'Usuario no encontrado' });
        }

        const usuario = usuarioResults[0];

        // Combinar los datos del adulto y el usuario
        const perfilUsuario = {
            email: usuario.email,
            role: usuario.role,
            nombre: adulto.nombre,
            snombre: adulto.snombre,
            apellido: adulto.apellido,
            sapellido: adulto.sapellido,
            fechanacimiento: adulto.fechanacimiento,
            ciudad: adulto.ciudad,
            estado: adulto.estado,
            direccion: adulto.direccion,
            curp: adulto.curp
        };

        res.status(200).json({ success: true, perfilUsuario });
    } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
};


const getUserIdFromAuthorizationKey = async (authKey) => {
    const [rows] = await db.promise().query('SELECT id FROM profesionales WHERE clave_autorizacion = ?', [authKey]);
    return rows.length > 0 ? rows[0].id : null;
};

exports.citasPendientes = async (req, res) => {
    const { authKey } = req.body;

    if (!authKey) {
        return res.status(400).json({ success: false, error: 'Clave de autorización no proporcionada' });
    }

    try {
        const userId = await getUserIdFromAuthorizationKey(authKey);
        if (!userId) {
            return res.status(400).json({ success: false, error: 'Clave de autorización no válida' });
        }

        const citasQuery = `
            SELECT c.id, c.motivo, c.fecha, c.hora, c.estado,
                   a.nombre, a.snombre, a.apellido, a.sapellido
            FROM citas c
            JOIN adultos a ON c.adulto_id = a.id
            WHERE c.psicologo_id = ? AND c.estado = 'pendiente'
        `;
        const [citasResults] = await db.promise().query(citasQuery, [userId]);

        res.status(200).json({ success: true, citas: citasResults });
    } catch (error) {
        console.error('Error al obtener citas pendientes:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
};

exports.detallesCita = async (req, res) => {
    const { id } = req.params;
    const authKey = req.headers['clave-autorizacion-profesional'];

    try {
        const userId = await getUserIdFromAuthorizationKey(authKey);
        if (!userId) {
            return res.status(400).json({ success: false, error: 'Clave de autorización no válida' });
        }

        const detallesQuery = `
            SELECT c.id, c.motivo, c.fecha, c.hora, c.estado,
                   a.nombre, a.snombre, a.apellido, a.sapellido
            FROM citas c
            JOIN adultos a ON c.adulto_id = a.id
            WHERE c.id = ? AND c.psicologo_id = ?
        `;
        const [detallesResults] = await db.promise().query(detallesQuery, [id, userId]);

        if (detallesResults.length === 0) {
            return res.status(404).json({ success: false, error: 'Cita no encontrada' });
        }

        res.status(200).json({ success: true, cita: detallesResults[0] });
    } catch (error) {
        console.error('Error al obtener detalles de la cita:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
};

exports.actualizarCita = async (req, res) => {
    const { id } = req.params;
    const { authKey, nuevoEstado } = req.body;

    try {
        const userId = await getUserIdFromAuthorizationKey(authKey);
        if (!userId) {
            return res.status(400).json({ success: false, error: 'Clave de autorización no válida' });
        }

        const actualizarQuery = `
            UPDATE citas
            SET estado = ?
            WHERE id = ? AND psicologo_id = ?
        `;
        const [result] = await db.promise().query(actualizarQuery, [nuevoEstado, id, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Cita no encontrada o no actualizada' });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error al actualizar estado de la cita:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
};

exports.obtenerCitasProfesional = async (req, res) => {
    const { claveAutorizacion } = req.body;

    try {
        const profesionalQuery = 'SELECT id FROM profesionales WHERE clave_autorizacion = ?';
        const [profesionalResults] = await db.promise().query(profesionalQuery, [claveAutorizacion]);

        if (profesionalResults.length === 0) {
            return res.status(400).json({ success: false, error: 'Clave de autorización inválida' });
        }

        const profesionalId = profesionalResults[0].id;

        const citasQuery = `
            SELECT c.id, c.motivo, c.fecha, c.hora, c.estado, 
                   a.nombre AS clienteNombre, a.snombre AS clienteSNombre, a.apellido AS clienteApellido, a.sapellido AS clienteSApellido
            FROM citas c
            JOIN adultos a ON c.adulto_id = a.id
            WHERE c.psicologo_id = ?
        `;
        const [citasResults] = await db.promise().query(citasQuery, [profesionalId]);

        res.json({ success: true, citas: citasResults });
    } catch (error) {
        console.error('Error al obtener citas del profesional:', error);
        res.status(500).json({ success: false, error: 'Error al obtener citas del profesional' });
    }
};

exports.obtenerPerfilProfesional = async (req, res) => {
    const { claveAutorizacion } = req.body;

    try {
        const profesionalQuery = `
            SELECT nombre, snombre, apellido, sapellido, fechanacimiento, ciudad, estado, direccion, curp, cedula_profesional, correo 
            FROM profesionales 
            WHERE clave_autorizacion = ?
        `;
        const [profesionalResults] = await db.promise().query(profesionalQuery, [claveAutorizacion]);

        if (profesionalResults.length === 0) {
            return res.status(400).json({ success: false, error: 'Clave de autorización inválida' });
        }

        res.json({ success: true, profesional: profesionalResults[0] });
    } catch (error) {
        console.error('Error al obtener el perfil del profesional:', error);
        res.status(500).json({ success: false, error: 'Error al obtener el perfil del profesional' });
    }
};

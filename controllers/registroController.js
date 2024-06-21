const mysql = require('mysql');

// Configurar la conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'citas',
    port: 3308
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos');
});

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



  exports.registrarDatosAdulto = (req, res) => {
    const { userId, nombre, snombre, apellido, sapellido, fechanacimiento, ciudad, estado, direccion, curp } = req.body;

    // Verificar si el usuario_id ya está registrado
    const checkUserIdQuery = 'SELECT * FROM adultos WHERE usuario_id = ?';
    db.query(checkUserIdQuery, [userId], (checkUserIdError, checkUserIdResults) => {
        if (checkUserIdError) {
            console.error('Error verificando usuario_id:', checkUserIdError);
            res.status(500).json({ success: false, error: 'Error verificando usuario_id' });
            return;
        }

        if (checkUserIdResults.length > 0) {
            res.status(400).json({ success: false, error: 'El usuario_id ya está registrado' });
            return;
        }

        // Verificar si el CURP ya está registrado
        const checkCurpQuery = 'SELECT * FROM adultos WHERE curp = ?';
        db.query(checkCurpQuery, [curp], (checkCurpError, checkCurpResults) => {
            if (checkCurpError) {
                console.error('Error verificando CURP:', checkCurpError);
                res.status(500).json({ success: false, error: 'Error verificando CURP' });
                return;
            }

            if (checkCurpResults.length > 0) {
                res.status(400).json({ success: false, error: 'El CURP ya está registrado' });
                return;
            }

            // Si todo está bien, insertar los datos del adulto
            const insertQuery = 'INSERT INTO adultos (usuario_id, nombre, snombre, apellido, sapellido, fechanacimiento, ciudad, estado, direccion, curp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const values = [userId, nombre, snombre, apellido, sapellido, fechanacimiento, ciudad, estado, direccion, curp];

            db.query(insertQuery, values, (insertError, results) => {
                if (insertError) {
                    console.error('Error insertando datos del adulto:', insertError);
                    res.status(500).json({ success: false, error: 'Error insertando datos del adulto' });
                    return;
                }

                res.status(200).json({ success: true });
            });
        });
    });
};


exports.registrarDatosProfesional = (req, res) => {
    const { userId, nombre, snombre, apellido, sapellido, fechanacimiento, ciudad, estado, direccion, curp, cedula_profesional } = req.body;

    // Verificar si el usuario_id ya está registrado como profesional
    const checkUserIdQuery = 'SELECT * FROM profesionales WHERE usuario_id = ?';
    db.query(checkUserIdQuery, [userId], (checkUserIdError, checkUserIdResults) => {
        if (checkUserIdError) {
            console.error('Error verificando usuario_id:', checkUserIdError);
            res.status(500).json({ success: false, error: 'Error verificando usuario_id' });
            return;
        }

        if (checkUserIdResults.length > 0) {
            res.status(400).json({ success: false, error: 'El usuario ya está registrado como profesional' });
            return;
        }

        // Verificar si el CURP ya está registrado
        const checkCurpQuery = 'SELECT * FROM profesionales WHERE curp = ?';
        db.query(checkCurpQuery, [curp], (checkCurpError, checkCurpResults) => {
            if (checkCurpError) {
                console.error('Error verificando CURP:', checkCurpError);
                res.status(500).json({ success: false, error: 'Error verificando CURP' });
                return;
            }

            if (checkCurpResults.length > 0) {
                res.status(400).json({ success: false, error: 'El CURP ya está registrado' });
                return;
            }

            // Verificar si la cédula profesional ya está registrada
            const checkCedulaQuery = 'SELECT * FROM profesionales WHERE cedula_profesional = ?';
            db.query(checkCedulaQuery, [cedula_profesional], (checkCedulaError, checkCedulaResults) => {
                if (checkCedulaError) {
                    console.error('Error verificando cédula profesional:', checkCedulaError);
                    res.status(500).json({ success: false, error: 'Error verificando cédula profesional' });
                    return;
                }

                if (checkCedulaResults.length > 0) {
                    res.status(400).json({ success: false, error: 'La cédula profesional ya está registrada' });
                    return;
                }

                // Si todo está bien, insertar los datos del profesional
                const insertQuery = 'INSERT INTO profesionales (usuario_id, nombre, snombre, apellido, sapellido, fechanacimiento, ciudad, estado, direccion, curp, cedula_profesional) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                const values = [userId, nombre, snombre, apellido, sapellido, fechanacimiento, ciudad, estado, direccion, curp, cedula_profesional];

                db.query(insertQuery, values, (insertError, results) => {
                    if (insertError) {
                        console.error('Error insertando datos del profesional:', insertError);
                        res.status(500).json({ success: false, error: 'Error insertando datos del profesional' });
                        return;
                    }

                    res.status(200).json({ success: true });
                });
            });
        });
    });
};



exports.registrarDatosNino = (req, res) => {
    const { userId, id_tutor, nombre, snombre, apellido, sapellido, fechanacimiento } = req.body;

    // Verificar si ya existe un niño con el mismo usuario_id
    const checkQuery = 'SELECT * FROM niños WHERE usuario_id = ?';
    db.query(checkQuery, [userId], (checkError, checkResults) => {
        if (checkError) {
            console.error('Error verificando usuario_id del niño:', checkError);
            res.status(500).json({ success: false, error: 'Error verificando usuario_id del niño' });
            return;
        }

        if (checkResults.length > 0) {
            res.status(400).json({ success: false, error: 'Ya existe un niño registrado con este usuario_id' });
            return;
        }

        // Si no hay niños registrados con este usuario_id, procedemos con la inserción
        const insertQuery = 'INSERT INTO niños (usuario_id, id_tutor, nombre, snombre, apellido, sapellido, fechanacimiento) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const values = [userId, id_tutor, nombre, snombre, apellido, sapellido, fechanacimiento];

        db.query(insertQuery, values, (insertError, results) => {
            if (insertError) {
                console.error('Error insertando datos del niño:', insertError);
                res.status(500).json({ success: false, error: 'Error insertando datos del niño' });
                return;
            }

            res.status(200).json({ success: true });
        });
    });
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


exports.crearCita = (req, res) => {
  
  
  const { userId, idTutor, profesionalId, motivo, area, resultadosEsperados, fecha, hora, modalidad, passwordTutor } = req.body;

  // Verificar si la contraseña del tutor es correcta
  const checkTutorQuery = 'SELECT * FROM usuarios WHERE id = ? AND password = ?';
  db.query(checkTutorQuery, [idTutor, passwordTutor], (checkError, checkResults) => {
      if (checkError) {
          console.error('Error verificando tutor:', checkError);
          res.status(500).json({ success: false, error: 'Error verificando tutor' });
          return;
      }

      if (checkResults.length === 0) {
          res.status(400).json({ success: false, error: 'Contraseña del tutor incorrecta' });
          return;
      }

      // Insertar nueva cita
      const insertQuery = 'INSERT INTO citas (usuario_id, profesional_id, id_tutor, motivo, area, resultados_esperados, fecha, hora, modalidad, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      const values = [userId, profesionalId, idTutor, motivo, area, resultadosEsperados, fecha, hora, modalidad, 'pendiente'];
      db.query(insertQuery, values, (insertError, insertResults) => {
          if (insertError) {
              console.error('Error creando cita:', insertError);
              res.status(500).json({ success: false, error: 'Error creando cita' });
              return;
          }

          res.status(200).json({ success: true, citaId: insertResults.insertId });
      });
  });
};

exports.gestionarCita = (req, res) => {
  const { citaId, accion } = req.body; // 'aceptar' o 'cancelar'
  const nuevoEstado = accion === 'aceptar' ? 'aceptada' : 'cancelada';

  const updateQuery = 'UPDATE citas SET estado = ? WHERE id = ?';
  db.query(updateQuery, [nuevoEstado, citaId], (updateError, updateResults) => {
      if (updateError) {
          console.error('Error gestionando cita:', updateError);
          res.status(500).json({ success: false, error: 'Error gestionando cita' });
          return;
      }

      res.status(200).json({ success: true });
  });
};



// Función para obtener todos los profesionales
exports.obtenerProfesionales = (req, res) => {
  const query = 'SELECT * FROM profesionales';
  db.query(query, (error, results) => {
      if (error) {
          console.error('Error obteniendo profesionales:', error);
          res.status(500).json({ success: false, error: 'Error obteniendo profesionales' });
          return;
      }
      res.status(200).json({ success: true, profesionales: results });
  });
};
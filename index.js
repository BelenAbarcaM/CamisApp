const express = require('express');
const app = express();

// Middleware para parsear JSON en las peticiones (body-parser integrado)
app.use(express.json());
const Usuario = require("./usuario_esquema");
const conectarBD = require("./conexion");
const path = require('path');
const bcrypt = require('bcryptjs'); 
app.use(express.static(path.join(__dirname, 'public')));
async function iniciarServidor() {
await conectarBD();
}
iniciarServidor();

app.post('/api/verificatoken',verificarToken, async (req, res) => {

console.log("entra")

  try {

    res.send("verificado")                      // Responde con la lista en formato JSON

  } catch (error) {

    console.log(error);

    res.status(500).json({ error: 'Error del servidor' }); // Error genérico en caso de fallo

  }

});

// Middleware para verificar JWT

function verificarToken(req, res, next) {

  console.log(req)

  const authHeader = req.headers['authorization'];  

  if (!authHeader) {

    return res.status(401).json({ error: 'Token requerido' });

  }

  const token = authHeader.split(' ')[1];  // Espera formato "Bearer token"

  console.log(token)

  try {

    const decoded = jwt.verify(token, 'SECRETO_SUPER_SEGUR0');    // Verifica y decodifica el token

    console.log(decoded)

    req.usuarioId = decoded.id;                    // Guardamos el id del token en la request para usarlo después

    next();                                       // Token válido, continuar a la siguiente función

  } catch (err) {

    return res.status(403).json({ error: 'Token inválido o expirado' });

  }

}

// Registro de un nuevo usuario

app.post('/api/registro', async (req, res) => {

  try {

    const { nombre, email, clave } = req.body;

    

    // 1. Generar un salt (semilla aleatoria) para el hash

    const salt = await bcrypt.genSalt(10);                  // 10 rondas de generación de salt

    // 2. Hashear la contraseña proporcionada usando el salt generado

    const hash = await bcrypt.hash(clave, salt);

    

    // 3. Crear y guardar el nuevo usuario con la contraseña hasheada

    const nuevoUsuario = new Usuario({ nombre, email, clave: hash });

    await nuevoUsuario.save();

    

    res.status(201).json({ mensaje: 'Usuario registrado con éxito', id: nuevoUsuario._id });

  } catch (error) {

    res.status(400).json({ error: 'No se pudo registrar el usuario' });

  }

});
const jwt = require('jsonwebtoken');

 

// Login de usuario (autenticación)

app.post('/api/login', async (req, res) => {

  try {

    const { email, clave } = req.body;

    

    // 1. Buscar al usuario por email

    const usuario = await Usuario.findOne({ email });

    if (!usuario) {

      return res.status(401).json({ error: 'Credenciales inválidas' }); // No se encontró el email

    }

    // 2. Verificar la contraseña con bcrypt.compare

    const passwordOk = await bcrypt.compare(clave, usuario.clave);

    if (!passwordOk) {

      return res.status(401).json({ error: 'Credenciales inválidas' }); // Contraseña incorrecta

    }

    

    // 3. Credenciales válidas: Generar token JWT

    const datosToken = { id: usuario._id };            // Podemos incluir datos en el token (p.ej. el ID de usuario)

    const secreto = 'SECRETO_SUPER_SEGUR0';            // Clave secreta para firmar el token (en producción, mantener en una variable de entorno)

    const opciones = { expiresIn: '1h' };              // El token expirará en 1 hora

    const token = jwt.sign(datosToken, secreto, opciones);

    

    // 4. Enviar el token al cliente

    res.json({ token });

  } catch (error) {

    res.status(500).json({ error: 'Error en el servidor' });

  }

});

// Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find();    // Busca todos los documentos de usuarios en la BD
    res.json(usuarios);                       // Responde con la lista en formato JSON
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' }); // Error genérico en caso de fallo
  }
});

// Obtener un usuario por ID
app.get('/api/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id); // Busca usuario por el ID proporcionado
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' }); // Si no existe, 404
    }
    res.json(usuario); // Si existe, lo devolvemos en JSON
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Crear un nuevo usuario
app.post('/api/usuarios', async (req, res) => {
  try {
    const datosUsuario = req.body;            // Obtenemos los datos enviados en la petición
    const nuevo = new Usuario(datosUsuario);  // Creamos un nuevo documento Usuario
    const usuarioGuardado = await nuevo.save();      // Guardamos en la base de datos
    res.status(201).json(usuarioGuardado);    // Devolvemos el usuario creado con código 201 (Creado)
  } catch (error) {
    res.status(400).json({ error: 'Error al crear usuario' }); // Posibles errores de validación
  }
});
const Camiseta = require("./camisetaEsquema");
 
// Crear un nuevo usuario
app.post('/api/camisetas', async (req, res) => {
  try {
    const datosCamiseta = req.body;            // Obtenemos los datos enviados en la petición
    const nuevo = new Camiseta(datosCamiseta);  // Creamos un nuevo documento Usuario
    const camisetaGuardada = await nuevo.save();      // Guardamos en la base de datos
    res.status(201).json(camisetaGuardada);    // Devolvemos el usuario creado con código 201 (Creado)
  } catch (error) {
    res.status(400).json({ error: 'Error al crear camiseta' }); // Posibles errores de validación
  }
});

// Actualizar un usuario existente
app.put('/api/usuarios/:id', async (req, res) => {
  try {
    const datosActualizados = req.body;
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      datosActualizados,
      { new: true } // opción new:true para obtener el documento actualizado
    );
    if (!usuarioActualizado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuarioActualizado);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar un usuario
app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuarioEliminado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});
// =====================================================
// CRUD DE CAMISETAS
// Todas las rutas requieren un token válido
// =====================================================
 
// Obtener las camisetas del usuario autenticado
app.get('/api/camisetas', verificarToken, async (req, res) => {
  try {
    const camisetas = await Camiseta.find({
      
    }).sort({ fechaCreacion: -1 });
 
    res.json(camisetas);
 
  } catch (error) {
    console.error('Error al obtener camisetas:', error);
 
    res.status(500).json({
      error: 'Error al obtener las camisetas'
    });
  }
});
 
 
// Obtener una camiseta específica del usuario
app.get('/api/camisetas/:id', verificarToken, async (req, res) => {
  try {
    const camiseta = await Camiseta.findOne({
      _id: req.params.id
    });
 
    if (!camiseta) {
      return res.status(404).json({
        error: 'Camiseta no encontrada'
      });
    }
 
    res.json(camiseta);
 
  } catch (error) {
    console.error('Error al obtener camiseta:', error);
 
    res.status(400).json({
      error: 'Identificador de camiseta inválido'
    });
  }
});
 
 
// Crear una nueva camiseta
app.post('/api/camisetas', verificarToken, async (req, res) => {
  try {
    const {
      torsoColor,
      mangaIzqColor,
      mangaDerColor,
      cuelloColor
    } = req.body;
 
    const nuevaCamiseta = new Camiseta({
      creador: req.usuarioId,
      torsoColor,
      mangaIzqColor,
      mangaDerColor,
      cuelloColor
    });
 
    const camisetaGuardada = await nuevaCamiseta.save();
 
    res.status(201).json(camisetaGuardada);
 
  } catch (error) {
    console.error('Error al crear camiseta:', error);
 
    res.status(400).json({
      error: 'Error al crear la camiseta'
    });
  }
});
 
 
// Actualizar una camiseta del usuario autenticado
app.put('/api/camisetas/:id', verificarToken, async (req, res) => {
  try {
    const {
      torsoColor,
      mangaIzqColor,
      mangaDerColor,
      cuelloColor
    } = req.body;
 
    const camisetaActualizada = await Camiseta.findOneAndUpdate(
      {
        _id: req.params.id
      },
      {
        torsoColor,
        mangaIzqColor,
        mangaDerColor,
        cuelloColor
      },
      {
        new: true,
        runValidators: true
      }
    );
 
    if (!camisetaActualizada) {
      return res.status(404).json({
        error: 'Camiseta no encontrada'
      });
    }
 
    res.json(camisetaActualizada);
 
  } catch (error) {
    console.error('Error al actualizar camiseta:', error);
 
    res.status(400).json({
      error: 'Error al actualizar la camiseta'
    });
  }
});
 
 
// Eliminar una camiseta del usuario autenticado
app.delete('/api/camisetas/:id', verificarToken, async (req, res) => {
  try {
    const camisetaEliminada = await Camiseta.findOneAndDelete({
      _id: req.params.id
    });
 
    if (!camisetaEliminada) {
      return res.status(404).json({
        error: 'Camiseta no encontrada'
      });
    }
 
    res.json({
      mensaje: 'Camiseta eliminada correctamente'
    });
 
  } catch (error) {
    console.error('Error al eliminar camiseta:', error);
 
    res.status(400).json({
      error: 'Error al eliminar la camiseta'
    });
  }
});
// Votar por una camiseta
app.put('/api/camisetas/:id/votar', verificarToken, async (req, res) => {
  try {
    const { voto } = req.body;
 
    // Solo se permite votar +1 o -1
    if (voto !== 1 && voto !== -1) {
      return res.status(400).json({
        error: 'El voto debe ser 1 o -1'
      });
    }
 
    const camisetaActualizada = await Camiseta.findByIdAndUpdate(
      req.params.id,
      {
        $inc: {
          calificacion: voto
        }
      },
      {
        new: true
      }
    );
 
    if (!camisetaActualizada) {
      return res.status(404).json({
        error: 'Camiseta no encontrada'
      });
    }
 
    res.json({
      mensaje: 'Voto registrado',
      calificacion: camisetaActualizada.calificacion,
      camiseta: camisetaActualizada
    });
 
  } catch (error) {
    console.error('Error al votar:', error);
 
    res.status(500).json({
      error: 'Error al registrar el voto'
    });
  }
});

app.get('/api/usuario-logueado', verificarToken, async (req, res) => {

  try {

    const usuario = await Usuario.findById(req.usuarioId).select('-clave');

 

    if (!usuario) {

      return res.status(404).json({

        error: 'Usuario no encontrado'

      });

    }

 

    res.json(usuario);

 

  } catch (error) {

    console.error('Error obteniendo el usuario:', error);

 

    res.status(500).json({

      error: 'Error al obtener los datos del usuario'

    });

  }

});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor API escuchando en http://localhost:${PORT}`);
});


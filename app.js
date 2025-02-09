const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const PORT = 3000;
// Crear la app de Express
const app = express();
app.use(express.json());

app.use(express.static('public'));

app.use(bodyParser.json());



// Configurar la conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Cambia por tu usuario si es necesario
    password: 'Gust211298',  // Cambia por tu contraseña de MySQL
    database: 'inventario_restaurante_obregon'  // Nombre de la base de datos
});

// Verificar conexión
db.connect(err => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
    } else {
        console.log('Conexión exitosa a la base de datos');
    }
});



// Rutas para el CRUD de productos

// Nueva ruta para obtener todos los productos
app.get('/productos', (req, res) => {
    const query = 'SELECT * FROM productos';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los productos:', err);
            return res.status(500).json({ message: 'Error al obtener los productos' });
        }
        res.json(results);
    });
});


// Agregar un nuevo producto
app.post('/productos', (req, res) => {
    const { nombre, cantidad, unidad_medida, costo_unidad, stock_minimo } = req.body;
    db.query(
        'INSERT INTO productos (nombre, cantidad, unidad_medida, costo_unidad, stock_minimo) VALUES (?, ?, ?, ?, ?)',
        [nombre, cantidad, unidad_medida, costo_unidad, stock_minimo],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.status(201).json({ message: 'Producto agregado correctamente', id: results.insertId });
        }
    );
});

// Nueva ruta para restar lo consumido del inventario
app.put('/productos/consumir/:id', (req, res) => {
    const { id } = req.params;
    const { cantidadConsumida } = req.body;

    const query = `UPDATE productos SET cantidad = cantidad - ? WHERE id = ? AND cantidad >= ?`;

    db.query(query, [cantidadConsumida, id, cantidadConsumida], (err, result) => {
        if (err) {
            console.error('Error al actualizar la cantidad:', err);
            return res.status(500).json({ message: 'Error al actualizar la cantidad' });
        }

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'Cantidad insuficiente o producto no encontrado' });
        }

        res.json({ message: 'Cantidad actualizada correctamente' });
    });
});

app.delete('/productos/:id', (req, res) => {
    const id = req.params.id;
    
    db.query('DELETE FROM productos WHERE id = ?', [id], (error, results) => {
        if (error) {
            console.error('Error al eliminar producto:', error);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto eliminado correctamente' });
    });
});

app.put('/productos/:id/reabastecer', (req, res) => {
    const id = req.params.id;
    const cantidad = req.body.cantidad;

    if (!cantidad || cantidad <= 0) {
        return res.status(400).json({ message: 'Cantidad no válida' });
    }

    db.query('UPDATE productos SET cantidad = cantidad + ? WHERE id = ?', [cantidad, id], (error, results) => {
        if (error) {
            console.error('Error al reabastecer:', error);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto reabastecido correctamente' });
    });
});
    

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Validar los campos
    if (!username || !password) {
        return res.status(400).json({ message: 'El nombre de usuario y la contraseña son obligatorios' });
    }

    // Verificar si el usuario ya existe
    db.query('SELECT * FROM usuarios WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Error al verificar el usuario:', err);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Hashear la contraseña
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error al hashear la contraseña:', err);
                return res.status(500).json({ message: 'Error interno al crear el usuario' });
            }

            // Insertar el nuevo usuario en la base de datos
            const query = 'INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)';
            db.query(query, [username, hashedPassword, 'user'], (err, result) => {
                if (err) {
                    console.error('Error al guardar el usuario:', err);
                    return res.status(500).json({ message: 'Error al guardar el usuario' });
                }

                res.status(201).json({ message: 'Usuario registrado correctamente' });
            });
        });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Buscar al usuario en la base de datos
    db.query('SELECT * FROM usuarios WHERE usuarios = ?', [username], (err, results) => {
        if (err) {
            console.error('Error al obtener el usuario', err);
            return res.status(500).json({ message: 'Error en el proceso de login' });
        }

        const user = results[0]; // Suponiendo que el primer resultado es el usuario

        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        // Comparar la contraseña encriptada con la ingresada
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                console.error('Error al comparar las contraseñas', err);
                return res.status(500).json({ message: 'Error en el proceso de login' });
            }

            if (result) {
                // La contraseña es correcta
                res.json({ success: true, user });
            } else {
                // La contraseña es incorrecta
                res.json({ success: false, message: 'Credenciales incorrectas' });
            }
        });
    });
});


// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});

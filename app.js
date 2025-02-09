const express = require('express');
const mysql = require('mysql2');

// Crear la app de Express
const app = express();
app.use(express.json());

app.use(express.static('public'));


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
    



// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});

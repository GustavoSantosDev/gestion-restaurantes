document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        window.location.href = 'login.html'; // Redirige al login si no está autenticado
    } else {
        console.log('Usuario autenticado:', user.username);
    }

    // Campo de búsqueda
    document.getElementById('buscador-nombre').addEventListener('input', function() {
        const searchQuery = this.value.toLowerCase(); // Obtenemos lo que se escribe
        cargarInventario(searchQuery); // Llamamos a la función de cargar inventario con el parámetro de búsqueda
    });

    // Mostrar el formulario de agregar producto
    document.getElementById('btn-agregar-producto').addEventListener('click', function() {
        document.body.classList.add('modal-open'); // Activa el fondo borroso
        document.getElementById('formulario-agregar').style.display = 'block'; // Muestra el formulario
    });

    // Cerrar formulario de agregar producto
    document.getElementById('cerrar-formulario').addEventListener('click', function() {
        document.body.classList.remove('modal-open'); // Desactiva el fondo borroso
        document.getElementById('formulario-agregar').style.display = 'none'; // Cierra el formulario
    });

    // Formulario de agregar producto
    document.getElementById('formulario').addEventListener('submit', function(event) {
        event.preventDefault();

        const nombre = document.getElementById('nombre').value;
        const cantidad = document.getElementById('cantidad').value;
        const unidad_medida = document.getElementById('unidad_medida').value;
        const costo_unidad = document.getElementById('costo_unidad').value;
        const stock_minimo = document.getElementById('stock_minimo').value;

        fetch('http://localhost:3000/productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, cantidad, unidad_medida, costo_unidad, stock_minimo })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('mensaje').textContent = data.message;
            cargarInventario();  // Recarga el inventario después de agregar el producto
            document.body.classList.remove('modal-open'); // Desactiva el fondo borroso
            document.getElementById('formulario-agregar').style.display = 'none'; // Cierra el formulario
        })
        .catch(error => console.error('Error:', error));
    });

    // Función para cargar el inventario y filtrarlo
    function cargarInventario(query = '') {
        fetch('http://localhost:3000/productos')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector("#tabla-inventario tbody");
            tbody.innerHTML = "";

            const productosFiltrados = data.filter(producto => {
                return producto.nombre.toLowerCase().includes(query); // Filtra los productos por nombre
            });

            productosFiltrados.forEach(producto => {
                const fila = document.createElement("tr");

                const alerta = producto.cantidad < producto.stock_minimo ? '<span class="alerta">¡Comprar más!</span>' : '';

                fila.innerHTML = `
                    <td>${producto.id}</td>
                    <td>${producto.nombre}</td>
                    <td>${producto.cantidad}</td>
                    <td>${producto.unidad_medida}</td>
                    <td>${producto.stock_minimo}</td>
                    <td>${alerta}</td>
                    <td>
                        <button class="btn-consumir" data-id="${producto.id}">Consumir</button>
                        <button class="btn-reabastecer" data-id="${producto.id}">🔄 Reabastecer</button>
                        <button class="btn-eliminar" data-id="${producto.id}">🗑️ Eliminar</button>
                    </td>
                `;

                tbody.appendChild(fila);
            });

            // Agregar eventos a los botones de cada producto
            document.querySelectorAll('.btn-consumir').forEach(boton => {
                boton.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    consumirProducto(id);
                });
            });

            document.querySelectorAll('.btn-reabastecer').forEach(boton => {
                boton.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    reabastecerProducto(id);
                });
            });

            document.querySelectorAll('.btn-eliminar').forEach(boton => {
                boton.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    eliminarProducto(id);
                });
            });
        })
        .catch(error => console.error('Error:', error));
    }

    // Función para consumir producto
    function consumirProducto(id) {
        const cantidadConsumida = prompt("¿Cuántas unidades deseas consumir?");
        if (cantidadConsumida && !isNaN(cantidadConsumida) && cantidadConsumida > 0) {
            fetch(`http://localhost:3000/productos/consumir/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cantidadConsumida })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);  // Mensaje de éxito
                cargarInventario();   // Actualizar el inventario
            })
            .catch(error => console.error('Error:', error));
        } else {
            alert("Ingresa una cantidad válida.");
        }
    }

    // Función para reabastecer producto
    function reabastecerProducto(id) {
        const cantidad = prompt("¿Cuántas unidades deseas agregar?");
        if (cantidad && !isNaN(cantidad) && cantidad > 0) {
            fetch(`http://localhost:3000/productos/${id}/reabastecer`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cantidad: parseInt(cantidad) })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);  // Mensaje de éxito
                cargarInventario();   // Actualizar la tabla
            })
            .catch(error => console.error('Error:', error));
        } else {
            alert("Ingresa una cantidad válida.");
        }
    }

    // Función para eliminar producto
    function eliminarProducto(id) {
        if (confirm("¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.")) {
            fetch(`http://localhost:3000/productos/${id}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);  // Mensaje de éxito o error
                cargarInventario();   // Volver a cargar el inventario
            })
            .catch(error => console.error('Error:', error));
        }
    }

    // Cargar inventario al inicio
    cargarInventario();
});

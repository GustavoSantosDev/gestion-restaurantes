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
    })
    .catch(error => console.error('Error:', error));
});

document.getElementById('form-consumo').addEventListener('submit', function(event) {
  event.preventDefault();

  const id = document.getElementById('id_producto').value;
 const cantidadConsumida = document.getElementById('cantidad_consumida').value;

 fetch(`http://localhost:3000/productos/consumir/${id}`, {
method: 'PUT',
headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cantidadConsumida })
  })
.then(response => response.json())
 .then(data => {
document.getElementById('mensaje').textContent = data.message;

// 🔥 Aquí actualizamos la tabla automáticamente después de consumir
cargarInventario();
  })
 .catch(error => console.error('Error:', error));
});

function cargarInventario() {
fetch('http://localhost:3000/productos')
.then(response => response.json())
.then(data => {
const tbody = document.querySelector("#tabla-inventario tbody");
tbody.innerHTML = "";

data.forEach(producto => {
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
            <button class="btn-reabastecer" data-id="${producto.id}">🔄 Reabastecer</button>
            <button class="btn-eliminar" data-id="${producto.id}">🗑️ Eliminar</button>
        </td>
    `;

    tbody.appendChild(fila);
});

// Agregar eventos a los botones
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

// Hacer que el botón "Ver Inventario" también use la nueva función
document.getElementById('ver-inventario').addEventListener('click', cargarInventario);

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



function eliminarProducto(id) {
if (confirm("¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.")) {
fetch(`http://localhost:3000/productos/${id}`, {
    method: 'DELETE'
})
.then(response => response.json())
.then(data => {
    alert(data.message);  // Mensaje de éxito o error
    cargarInventario();   // Volver a cargar la tabla después de eliminar
})
.catch(error => console.error('Error:', error));
}
}


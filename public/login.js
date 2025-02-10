document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Evita que el formulario recargue la página

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch('http://localhost:3000/login', {  
        method: 'POST',  
        headers: {  
            'Content-Type': 'application/json'  
        },  
        body: JSON.stringify({ username, password })  
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Guardar el rol y el usuario en localStorage para futuras verificaciones
            localStorage.setItem("role", data.role); 
            localStorage.setItem("user", JSON.stringify({ username: data.username, role: data.role }));

            alert("Inicio de sesión exitoso");
            window.location.href = "index.html"; // Redirigir a la página de inventario después del inicio de sesión
        } else {
            alert("Credenciales incorrectas");
        }
    })
    .catch(error => console.error('Error:', error));
});

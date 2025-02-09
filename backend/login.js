// login.js
document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch('http://localhost:3000/login', { // Cambia la URL según tu backend
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user)); // Guardamos la sesión
            window.location.href = "inventario.html"; // Redirigimos al inventario
        } else {
            alert('Credenciales incorrectas');
        }
    })
    .catch(error => console.error('Error:', error));
});

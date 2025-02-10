// register.js
document.getElementById("register-form").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch('http://localhost:3000/register', { // Asegúrate de que esta URL es correcta
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Usuario registrado correctamente') {
            alert('Registro exitoso');
            window.location.href = "login.html"; // Redirigir a la página de login después del registro
        } else {
            alert(data.message); // Mostrar mensaje de error
        }
    })
    .catch(error => console.error('Error:', error));
});
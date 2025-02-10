document.addEventListener("DOMContentLoaded", function() {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (user && token) {
        document.getElementById("username").textContent = user.username;
        document.getElementById("user-info").style.display = 'block';

         // Configurar el botón de cierre de sesión
         document.getElementById('logout-button').addEventListener('click', () => {
            localStorage.removeItem('user'); // Eliminar usuario del almacenamiento
            window.location.href = 'login.html'; // Redirigir al login
        });
    } else {
        window.location.href = "login.html";  // Redirigir al login si no hay usuario
    }
});

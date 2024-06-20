document.addEventListener('DOMContentLoaded', function() {
    var loginForm = document.getElementById('loginForm');
  
    if (loginForm) {
      loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
  
        var email = document.getElementById('email').value;
        var password = document.getElementById('password').value;
  
        // Envía la solicitud POST al servidor para iniciar sesión
        fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: email, password: password })
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Determina el tipo de usuario y redirige a la página correspondiente
            switch (data.role) {
              case 'adulto':
                window.location.href = 'Adultos/PaginaPrincipalA.html';
                break;
              case 'profesional':
                window.location.href = '/profesional.html';
                break;
              case 'nino':
                window.location.href = 'Ninos/PaginaPrincipalN.html';
                break;
              default:
                console.error('Rol de usuario desconocido:', data.role);
            }
          } else {
            alert('Error al iniciar sesión: ' + data.error);
          }
        })
        .catch(error => {
          console.error('Error al iniciar sesión:', error);
          alert('Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.');
        });
      });
    }
  });
  
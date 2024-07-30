document.addEventListener('DOMContentLoaded', function() {
  var loginForm = document.getElementById('loginForm');
  var authModal = document.getElementById('authModal');
  var closeAuthModal = document.getElementById('closeAuthModal');
  var authForm = document.getElementById('authForm');

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
                  // Muestra el modal para ingresar la clave de autorización
                  authModal.style.display = 'block';

                  // Maneja el envío del formulario de autorización
                  authForm.addEventListener('submit', function(event) {
                      event.preventDefault();
                      var authKey = document.getElementById('authKey').value;

                      // Verifica la clave de autorización
                      fetch('/api/verificar-clave', {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({ userId: data.userId, authKey: authKey })
                      })
                      .then(response => response.json())
                      .then(authData => {
                          if (authData.success) {
                              // Guarda la clave en localStorage según el rol
                              if (authData.role === 'adulto') {
                                  localStorage.setItem('claveAutorizacionAdulto', authKey);
                                  window.location.href = '/A';
                              } else if (authData.role === 'profesional') {
                                  localStorage.setItem('claveAutorizacionProfesional', authKey);
                                  window.location.href = '/P';
                              }
                          } else {
                              alert('Clave de autorización incorrecta');
                          }
                      })
                      .catch(error => {
                          console.error('Error al verificar clave de autorización:', error);
                          alert('Error al verificar clave de autorización. Por favor, inténtalo de nuevo más tarde.');
                      });
                  });

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

  // Cierra el modal cuando se hace clic en el botón de cerrar
  if (closeAuthModal) {
      closeAuthModal.addEventListener('click', function() {
          authModal.style.display = 'none';
      });
  }

  // Cierra el modal si se hace clic fuera del contenido del modal
  window.addEventListener('click', function(event) {
      if (event.target === authModal) {
          authModal.style.display = 'none';
      }
  });
});

document.addEventListener('DOMContentLoaded', function() {
    var form = document.getElementById('registrationForm');
  
    if (form) {
      form.addEventListener('submit', function(event) {
        event.preventDefault();
  
        var email = document.getElementById('email').value;
        var password = document.getElementById('password').value;
  
        // Mostrar la ventana modal para seleccionar el rol
        var modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1000';
        
  
        var modalContent = document.createElement('div');
        modalContent.style.backgroundColor = 'white';
        modalContent.style.padding = '20px';
        modalContent.style.borderRadius = '10px';
        modalContent.style.textAlign = 'center';
        modalContent.style.gap = '10px';
  
        var title = document.createElement('h2');
        title.innerText = 'Seleccione su rol';
        modalContent.appendChild(title);
  
        var buttonAdulto = document.createElement('button');
        buttonAdulto.innerText = 'Adulto';
        buttonAdulto.style.marginRight = '10px';
        buttonAdulto.onclick = function() {
          registrarUsuario(email, password, 'adulto');
        };
        modalContent.appendChild(buttonAdulto);
  
        var buttonProfesional = document.createElement('button');
        buttonProfesional.innerText = 'Profesional';
        buttonProfesional.style.marginRight = '10px';
        buttonProfesional.onclick = function() {
          registrarUsuario(email, password, 'profesional');
        };
        modalContent.appendChild(buttonProfesional);
  
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
      });
    }
  });
  
  function registrarUsuario(email, password, role) {
    fetch('/api/registro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email, password: password, role: role })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        if (role === 'adulto') {
          window.location.href = `/RegistroA?userId=${data.userId}`;
        } else if (role === 'profesional') {
          window.location.href = `/RegistroP?userId=${data.userId}`;
        }
      } else {
        alert('Error registrando usuario');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
  
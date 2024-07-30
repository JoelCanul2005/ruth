document.addEventListener('DOMContentLoaded', () => {
    // Función para cargar la lista de psicólogos
    const cargarPsicologos = async () => {
        try {
            const response = await fetch('/api/citas/psicologos');
            const data = await response.json();
            if (data.success) {
                const select = document.getElementById('psicologos');
                select.innerHTML = ''; // Limpiar el contenido anterior
                data.psicologos.forEach(psicologo => {
                    const option = document.createElement('option');
                    option.value = psicologo.id;
                    option.textContent = `${psicologo.nombre} ${psicologo.snombre} ${psicologo.apellido} ${psicologo.sapellido}`;
                    select.appendChild(option);
                });
            } else {
                console.error('Error al cargar psicólogos:', data.error);
            }
        } catch (error) {
            console.error('Error al obtener psicólogos:', error);
        }
    };

    // Función para crear una cita
    const crearCita = async (event) => {
        event.preventDefault();

        const motivo = document.getElementById('motivo').value;
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;
        const psicologoId = document.getElementById('psicologos').value;
        const claveAutorizacion = document.getElementById('claveAutorizacion').value;

        // Verificar la clave de autorización
        const claveAutorizacionGuardada = localStorage.getItem('claveAutorizacionAdulto');
        if (claveAutorizacion !== claveAutorizacionGuardada) {
            const resultadoDiv = document.getElementById('resultado');
            resultadoDiv.textContent = 'Error: La clave de autorización ingresada no es válida.';
            resultadoDiv.style.color = 'red';
            return;
        }

        try {
            const response = await fetch('/api/citas/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ motivo, fecha, hora, psicologoId, claveAutorizacion })
            });
            const data = await response.json();
            const resultadoDiv = document.getElementById('resultado');
            if (data.success) {
                resultadoDiv.textContent = 'Cita creada exitosamente. Se te ha enviado un correo con los detalles.';
                resultadoDiv.style.color = 'green';
            } else {
                resultadoDiv.textContent = `Error: ${data.error}`;
                resultadoDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Error al crear la cita:', error);
        }
    };

    // Cargar psicólogos al cargar la página
    cargarPsicologos();

    // Manejar el formulario de cita
    document.getElementById('citaForm').addEventListener('submit', crearCita);
});

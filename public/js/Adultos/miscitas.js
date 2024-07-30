document.addEventListener('DOMContentLoaded', () => {
    let citas = [];

    // Función para obtener citas
    const obtenerCitas = async () => {
        let claveAutorizacion = localStorage.getItem('claveAutorizacionAdulto');

        if (!claveAutorizacion) {
            claveAutorizacion = prompt('Introduce tu clave de autorización');
            if (!claveAutorizacion) {
                alert('La clave de autorización es necesaria');
                return;
            }
            localStorage.setItem('claveAutorizacionAdulto', claveAutorizacion);
        }

        try {
            const response = await fetch('/api/citas/obtener', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ claveAutorizacion })
            });

            const data = await response.json();
            if (data.success) {
                citas = data.citas; // Guardar citas en una variable global
                mostrarCitas(citas); // Mostrar todas las citas inicialmente
            } else {
                console.error('Error al obtener citas:', data.error);
            }
        } catch (error) {
            console.error('Error al obtener citas:', error);
        }
    };

    // Función para mostrar citas en la tabla
    const mostrarCitas = (citas) => {
        console.log("Citas a mostrar:", citas); // Verifica los datos aquí
        const tbody = document.querySelector('#citasTable tbody');
        tbody.innerHTML = ''; // Limpiar tabla

        citas.forEach(cita => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cita.nombre} ${cita.snombre} ${cita.apellido} ${cita.sapellido}</td>
                <td>${cita.fecha}</td>
                <td>${cita.hora}</td>
                <td>${cita.motivo}</td>
                <td>${cita.estado}</td>
                <td><button class="btn-custom btn-secondary-custom" onclick="cancelarCita(${cita.id})">Cancelar</button></td>
            `;
            tbody.appendChild(tr);
        });
    };

    // Función para cancelar una cita
    window.cancelarCita = async (citaId) => {
        if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
            try {
                const response = await fetch('/api/citas/cancelar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ citaId })
                });

                const data = await response.json();
                if (data.success) {
                    mostrarModal('Cita cancelada exitosamente');
                    obtenerCitas(); // Volver a cargar las citas después de cancelar
                } else {
                    mostrarModal(`Error: ${data.error}`);
                }
            } catch (error) {
                console.error('Error al cancelar la cita:', error);
            }
        }
    };

    // Función para mostrar el modal
    const mostrarModal = (mensaje) => {
        const modal = document.getElementById('modal');
        const modalMessage = document.getElementById('modalMessage');
        const closeModal = document.getElementById('closeModal');

        modalMessage.textContent = mensaje;
        modal.style.display = 'block';

        closeModal.onclick = () => {
            modal.style.display = 'none';
        };

        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    };

    // Función para aplicar filtros
    const aplicarFiltros = () => {
        const filtroPsicologo = document.getElementById('filtroPsicologo').value.toLowerCase();
        const filtroFecha = document.getElementById('filtroFecha').value;
        const filtroEstado = document.getElementById('filtroEstado').value;
        const filtroCercania = document.getElementById('filtroCercania').checked;

        console.log("Filtro Psicólogo:", filtroPsicologo);
        console.log("Filtro Fecha:", filtroFecha);
        console.log("Filtro Estado:", filtroEstado);
        console.log("Filtro Cercanía:", filtroCercania);

        // Convertir la fecha del filtro a un objeto Date
        const fechaFiltro = filtroFecha ? new Date(filtroFecha) : null;
        console.log("Fecha Filtro (objeto Date):", fechaFiltro);

        const citasFiltradas = citas.filter(cita => {
            const nombreCompleto = `${cita.nombre} ${cita.snombre} ${cita.apellido} ${cita.sapellido}`.toLowerCase();
            const coincidePsicologo = !filtroPsicologo || nombreCompleto.includes(filtroPsicologo);
            
            const fechaCita = new Date(cita.fecha);
            console.log("Fecha Cita (objeto Date):", fechaCita);

            const coincideFecha = !fechaFiltro || fechaCita.toISOString().split('T')[0] === fechaFiltro.toISOString().split('T')[0];
            console.log("Coincide Fecha:", coincideFecha);
            
            const coincideEstado = !filtroEstado || cita.estado === filtroEstado;

            // Lógica para filtro de citas más cercanas
            const hoy = new Date();
            const sieteDiasDespues = new Date();
            sieteDiasDespues.setDate(hoy.getDate() + 7);
            const esCercana = !filtroCercania || (cita.estado === 'confirmada' && fechaCita >= hoy && fechaCita <= sieteDiasDespues);
            
            console.log("Es Cercana:", esCercana);

            return coincidePsicologo && coincideFecha && coincideEstado && esCercana;
        });

        console.log("Citas Filtradas:", citasFiltradas);
        mostrarCitas(citasFiltradas);
    };

    // Añadir evento input para el filtro de psicólogo
    document.getElementById('filtroPsicologo').addEventListener('input', aplicarFiltros);

    // Añadir evento change para los demás filtros
    document.getElementById('filtroFecha').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroEstado').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroCercania').addEventListener('change', aplicarFiltros);

    // Cargar citas al cargar la página
    obtenerCitas();
});
